import time
import redis
import pickle
import datetime
import google.generativeai as genai
from google.generativeai import caching

from src.prompt import generate_prompt
from src.news import fetch_news_with_query
from src.tools import (
    FETCH_DOCUMENT_DETAILS,
    FETCH_LATEST_NEWS,
    execute_function_call,
    parse_args_to_dict,
)


class Server:
    def __init__(
        self,
        gov_api_key: str,
        genai_api_key: str,
        news_api_key: str,
        redis_host: str="localhost",
        redis_port: int=6379,
        redis_db: int=0,
    ) -> None:
        self.redis_client = redis.StrictRedis(
            host=redis_host, port=redis_port, db=redis_db
        )
        self._gov_api_key = gov_api_key
        self._genai_api_key = genai_api_key
        self._news_api_key = news_api_key
        genai.configure(api_key=self._genai_api_key)

    def _load_history(self, session_id: str) -> list:
        """
        Fetch chat history from Redis. If the session ID doesn't exist or has expired, return an empty list.
        """
        serialized_history = self.redis_client.get(session_id)
        if serialized_history:
            return pickle.loads(serialized_history)  # Deserialize the history
        return []

    def _save_history(self, session_id: str, history: list, ttl: int=600) -> None:
        """
        Save chat history to Redis with a TTL (time-to-live) that resets on each update.

        Args:
            session_id (str): The unique session ID.
            history (list): The chat history to save.
            ttl (int): Time-to-live in seconds (default: 600 seconds or 10 minutes).
        """
        serialized_history = pickle.dumps(history)
        # Use SETEX to store the value with a timeout
        self.redis_client.setex(session_id, ttl, serialized_history)

    def _create_model_cache(
        self, cache_name: str, model_name: str, system_instruction: str
    ) -> caching.CachedContent:
        return caching.CachedContent.create(
            model=f"models/{model_name}-002",
            display_name=cache_name,
            system_instruction=system_instruction,
            tools=[
                FETCH_DOCUMENT_DETAILS,
                # FETCH_LATEST_NEWS,
            ],
            ttl=datetime.timedelta(minutes=30),
        )

    def _check_cache_exists(self, cache_name: str) -> bool:
        for c in caching.CachedContent.list():
            if c.display_name == cache_name:
                return True
        return False

    def _get_model_cache(self, cache_name: str) -> caching.CachedContent:
        for c in caching.CachedContent.list():
            if c.display_name == cache_name:
                print(f"Found cache for {cache_name}")
                return c
        raise ValueError(f"Model cache for {cache_name} not found.")

    def _create_model(
        self, name: str, model_name: str, system_instruction: str
    ) -> genai.GenerativeModel:
        """
        Creates a GenerativeModel instance with a retry mechanism for cache creation.

        Args:
            name (str): The name of the model.
            model_name (str): The underlying model's name.
            system_instruction (str): System instructions for the model.

        Returns:
            genai.GenerativeModel: The initialized GenerativeModel instance.

        Raises:
            Exception: If cache creation fails after 3 attempts.
        """
        max_retries = 3
        attempt = 0

        while attempt < max_retries:
            try:
                cache = self._create_model_cache(name, model_name, system_instruction)
                # If cache creation is successful, break out of the loop
                return genai.GenerativeModel.from_cached_content(cached_content=cache)
            except Exception as e:
                attempt += 1
                if attempt < max_retries:
                    print(f"Cache creation failed (attempt {attempt}). Retrying...")
                    time.sleep(1)  # Optional: Add a delay before retrying
                else:
                    raise Exception(
                        f"Failed to create cache after {max_retries} attempts: {e}"
                    )

    def _get_model(self, agency: str) -> genai.GenerativeModel:
        name = f"{agency}_model"
        if not self._check_cache_exists(name):
            system_instruction = generate_prompt(self._gov_api_key, agency)
            model = self._create_model(name, "gemini-1.5-pro", system_instruction)
        else:
            model = genai.GenerativeModel.from_cached_content(
                cached_content=self._get_model_cache(name)
            )
        return model

    def handle_message(self, session_id: str, agency: str, message: str) -> dict:
        model = self._get_model(agency)

        # Load history from Redis
        cached_history = self._load_history(session_id)
        chat = model.start_chat(
            history=cached_history, 
            enable_automatic_function_calling=True,
        )

        # Send the user's message
        res = chat.send_message(message)
        attachments = []

        # Process model responses
        while True:
            new_response_parts = []

            for part in res.parts:
                if fn := part.function_call:
                    print(f"Executing {fn.name}")
                    args = parse_args_to_dict(fn.args)
                    fn_res = execute_function_call(fn.name, args, self._gov_api_key)

                    if fn_res.get("status") == "success":
                        attachments.append(fn_res.get("result"))

                    # Add the function response to response parts
                    new_response_parts.append(
                        genai.protos.Part(
                            function_response=genai.protos.FunctionResponse(
                                name=fn.name, response=fn_res
                            )
                        )
                    )

            # If no new function calls, break the loop
            if not new_response_parts:
                break

            # Send function responses to the model
            res = chat.send_message(new_response_parts)

        # Save updated history to Redis
        self._save_history(session_id, chat.history)

        # Return the final response
        return {
            "text": res.text,
            "attachments": attachments,
        }

    def fetch_news(self, query: str) -> dict:
        return fetch_news_with_query(self._news_api_key, query)
