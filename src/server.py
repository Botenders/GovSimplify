import datetime
import google.generativeai as genai
from google.generativeai import caching


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
            # tools=[fetch_document_details_tool],
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
