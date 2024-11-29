from fastapi import FastAPI

from src import Server

app = FastAPI()
server = Server()

@app.get("/chat")
async def handle_chat():
    return {"message": "Hello, World!"}