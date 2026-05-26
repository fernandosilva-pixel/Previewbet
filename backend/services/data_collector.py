"""
Coleta jogos de APIs externas (API-Sports / RapidAPI, The-Odds-API).
Roda via APScheduler a cada 30 minutos.
"""

import httpx
from database import settings, supabase


async def fetch_and_store_games(date: str = "today") -> int:
    """Busca jogos da API externa e persiste no Supabase. Retorna quantidade inserida/atualizada."""
    raise NotImplementedError("Implementar após configurar chaves de API")


async def fetch_odds(game_external_id: str) -> dict | None:
    """Busca odds de um jogo específico via The-Odds-API."""
    raise NotImplementedError("Implementar após configurar THE_ODDS_API_KEY")
