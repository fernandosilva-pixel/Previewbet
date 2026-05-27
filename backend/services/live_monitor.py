from __future__ import annotations

"""
Monitora jogos ao vivo e emite alertas via WebSocket quando
as condições de pressão/oportunidade são atingidas.
"""

from database import supabase


async def check_live_conditions(game_id: int, stats: dict) -> dict | None:
    """Avalia se o jogo atingiu condição de alerta. Retorna o alerta ou None."""
    raise NotImplementedError("Implementar na etapa de integração real")
