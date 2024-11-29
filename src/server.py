import datetime
import google.generativeai as genai
from google.generativeai import caching

from src.tools import FETCH_DOCUMENT_DETAILS, FETCH_LATEST_NEWS


class Server:
    def __init__(self, gov_api_kei: str, genai_api_key: str) -> None:
        self._gov_api_key = gov_api_kei
        self._genai_api_key = genai_api_key

    def _create_model_cache(
        self, name: str, model_name: str, system_instruction: str
    ) -> caching.CachedContent:
        return caching.CachedContent.create(
            model=f"models/{model_name}-002",
            display_name=name,
            system_instruction=system_instruction,
            tools=[
                FETCH_DOCUMENT_DETAILS,
                FETCH_LATEST_NEWS,
            ],
            ttl=datetime.timedelta(minutes=30),
        )

    def _get_model_cache(self, name: str) -> caching.CachedContent:
        return caching.CachedContent.get(name)

    def _create_model(
        self, name: str, model_name: str, system_instruction: str
    ) -> genai.Model:
        cache = self._create_model_cache(name, model_name, system_instruction)
        return genai.GenerativeModel.from_cached_content(cached_content=cache)

    def _get_model(self, name: str) -> genai.Model:
        cache = self._get_model_cache(name)
        return genai.GenerativeModel.from_cached_content(cached_content=cache)

    def handle_message(self, name: str, message: str) -> str:
        model = self._get_model(name)
        chat = model.start_chat()
        res = chat.send_message(message)  # Send initial message

        # Loop until no more function calls are required
        while True:
            new_response_parts = []

            # Iterate over response parts for function calls or text
            for part in res.parts:
                if text := part.text:
                    pass
                    # print(text)  # Print text responses
                elif fn := part.function_call:
                    print(f"Executing {fn.name}")
                    # Parse arguments and execute the function
                    args = ...  # parse_args_to_dict(fn.args)
                    fn_res = ...  # execute_function_call(fn.name, args, api_key)

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

        # Print the final text response after all function calls are processed
        print(res.text)
