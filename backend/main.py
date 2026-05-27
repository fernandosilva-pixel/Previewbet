import os
import sys
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

# ---------------------------------------------------------------------------
# Diagnóstico de startup — visível nos logs do Railway
# ---------------------------------------------------------------------------
_port = os.getenv("PORT", "8000")
print(f"[startup] PORT={_port}", flush=True)
print(f"[startup] Python {sys.version}", flush=True)
print(f"[startup] CWD={os.getcwd()}", flush=True)

# ---------------------------------------------------------------------------
# Importar rotas (com captura de erros para diagnóstico)
# ---------------------------------------------------------------------------
try:
    from routes import games, analysis, auth, bingos, subscription, stats
    print("[startup] Todas as rotas importadas com sucesso", flush=True)
except Exception as _import_err:
    print(f"[startup] ERRO ao importar rotas: {_import_err}", flush=True)
    raise


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
    print("[lifespan] Startup OK", flush=True)
    yield
    print("[lifespan] Shutdown", flush=True)


app = FastAPI(
    title="Royaltips API",
    version="0.1.0",
    description="Plataforma de palpites de futebol gerados por IA",
    lifespan=lifespan,
)

# ALLOWED_ORIGINS aceita múltiplas origens separadas por vírgula
_raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")
_allowed_origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]
print(f"[startup] CORS origins: {_allowed_origins}", flush=True)

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
    return {"status": "ok", "port": _port}


@app.get("/")
async def root():
    return {"status": "ok", "service": "Royaltips API"}


# ---------------------------------------------------------------------------
# WebSocket — placares e alertas ao vivo
# ---------------------------------------------------------------------------

@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await manager.connect(ws)
    try:
        while True:
            data = await ws.receive_json()
            await ws.send_json({"type": "ack", "received": data})
    except WebSocketDisconnect:
        manager.disconnect(ws)


# ---------------------------------------------------------------------------
# Entrypoint — usado pelo Railway via `python main.py`
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    print(f"[main] Iniciando uvicorn na porta {port}", flush=True)
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
