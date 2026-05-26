import os
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from routes import games, analysis, auth, bingos, subscription, stats


# ---------------------------------------------------------------------------
# WebSocket connection manager
# ---------------------------------------------------------------------------

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active_connections.append(ws)

    def disconnect(self, ws: WebSocket):
        if ws in self.active_connections:
            self.active_connections.remove(ws)

    async def broadcast(self, message: dict[str, Any]):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                self.disconnect(connection)


manager = ConnectionManager()


# ---------------------------------------------------------------------------
# App lifecycle
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: iniciar scheduler quando o banco estiver configurado
    yield
    # Shutdown: cleanup


app = FastAPI(
    title="Oraculous Bet API",
    version="0.1.0",
    description="Plataforma de palpites de futebol gerados por IA",
    lifespan=lifespan,
)

# ALLOWED_ORIGINS aceita múltiplas origens separadas por vírgula
_raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")
_allowed_origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Rotas
# ---------------------------------------------------------------------------

app.include_router(games.router, prefix="/api", tags=["games"])
app.include_router(analysis.router, prefix="/api", tags=["analysis"])
app.include_router(auth.router, prefix="/api", tags=["auth"])
app.include_router(bingos.router, prefix="/api", tags=["bingos"])
app.include_router(subscription.router, prefix="/api", tags=["subscription"])
app.include_router(stats.router, prefix="/api", tags=["stats"])


@app.get("/health")
async def health():
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# WebSocket — placares e alertas ao vivo
# ---------------------------------------------------------------------------

@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await manager.connect(ws)
    try:
        while True:
            data = await ws.receive_json()
            # Echo de volta para confirmar recebimento (lógica real no live_monitor)
            await ws.send_json({"type": "ack", "received": data})
    except WebSocketDisconnect:
        manager.disconnect(ws)
