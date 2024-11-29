import requests_cache
from datetime import datetime
from fastapi import FastAPI, Request

from src.server import Server

app = FastAPI()
server = Server(
    gov_api_key = "",
    genai_api_key = "",
    news_api_key = "pub_60731411687c0414b085c0e6df47b94f07cfc",
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
    return {
        "text": payload['message'],  # The response message
        "timestamp": datetime.now().isoformat()  # Current timestamp in ISO format
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="localhost", port=8000)