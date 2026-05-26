"""
Memória histórica: recupera resultados verificados anteriores para
enriquecer o contexto enviado ao Claude e melhorar acurácia ao longo do tempo.
"""

from database import supabase


async def get_league_memory(league: str, limit: int = 20) -> str:
    """Retorna um resumo dos últimos acertos/erros da liga para incluir no prompt."""
    raise NotImplementedError("Implementar na etapa de integração real")


async def save_verified_result(analysis_id: int, game_id: int, real_result: dict) -> None:
    """Persiste o resultado real verificado para alimentar a memória."""
    raise NotImplementedError("Implementar na etapa de integração real")
