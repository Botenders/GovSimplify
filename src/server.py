

class Server:
    def __init__(self):
        self._clients = []

    def add_client(self, client):
        self._clients.append(client)

    def remove_client(self, client):
        self._clients.remove(client)

    def broadcast(self, message):
        for client in self._clients:
            client.send(message)