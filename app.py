import os
import dotenv
import requests_cache
from datetime import datetime
from fastapi import FastAPI, Request

from src.server import Server

dotenv.load_dotenv()

app = FastAPI()
server = Server(
    gov_api_key=os.getenv("GOV_API_KEY"),
    genai_api_key=os.getenv("GENAI_API_KEY"),
    news_api_key=os.getenv("NEWS_API_KEY"),
)

requests_cache.install_cache(
    cache_name="botenders_gov_simplify_cache",
    expire_after=3600,
    allowable_methods=["GET"],
)


@app.get("/news/{query}")
async def fetch_news(query: str):
    return server.fetch_news(query)


@app.post("/message/{agency}")
async def handle_message(request: Request, agency: str):
    payload = await request.json()
    response = server.handle_message(payload["sessionId"], agency, payload["message"])
    response["timestamp"] = datetime.now().isoformat()
    return response


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="localhost", port=8000)
