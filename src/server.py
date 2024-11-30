import datetime
import time
import google.generativeai as genai
from google.generativeai import caching

from src.prompt import generate_prompt
from src.news import fetch_news_with_query
from src.tools import FETCH_DOCUMENT_DETAILS, FETCH_LATEST_NEWS, execute_function_call, parse_args_to_dict

class Server:
    def __init__(self, gov_api_key: str, genai_api_key: str, news_api_key: str) -> None:
        self._gov_api_key = gov_api_key
        self._genai_api_key = genai_api_key
        self._news_api_key = news_api_key
        genai.configure(api_key=self._genai_api_key)

    def _create_model_cache(
        self, name: str, model_name: str, system_instruction: str
    ) -> caching.CachedContent:
        return caching.CachedContent.create(
            model=f"models/{model_name}-002",
            display_name=name,
            system_instruction=system_instruction,
            tools=[
                FETCH_DOCUMENT_DETAILS,
                # FETCH_LATEST_NEWS,
            ],
            ttl=datetime.timedelta(minutes=30),
        )

    def _check_cache_exists(self, name: str) -> bool:
        for c in caching.CachedContent.list():
            if c.display_name == name:
                return True
        return False

    def _get_model_cache(self, name: str) -> caching.CachedContent:
        for c in caching.CachedContent.list():
            if c.display_name == name:
                return c
        raise ValueError(f"Model cache for {name} not found.")

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

    def handle_message(self, name: str, message: str) -> dict:
        model = self._get_model(name)
        chat = model.start_chat()
        res = chat.send_message(message)  # Send initial message
        attachments = []

        # Loop until no more function calls are required
        while True:
            new_response_parts = []

            # Iterate over response parts for function calls or text
            for part in res.parts:
                if _ := part.text:
                    pass
                    # print(text)  # Print text responses
                elif fn := part.function_call:
                    print(f"Executing {fn.name}")
                    # Parse arguments and execute the function
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

            # Send the function responses to the model and get further output
            res = chat.send_message(new_response_parts)

        return {
            "text": res.text,
            "attachments": attachments,
        }

    def fetch_news(self, query: str) -> dict:
        return fetch_news_with_query(self._news_api_key, query)
