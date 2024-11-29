import requests_cache
from fastapi import FastAPI

from src import Server

app = FastAPI()
server = Server()

requests_cache.install_cache(
    cache_name="gov_simplify_cache",
    expire_after=3600,
    allowable_methods=["GET"],
)

@app.post("/message")
async def handle_message():
    return {"response": "Hello, World!"}