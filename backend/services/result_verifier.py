"""
Verifica automaticamente os resultados reais após o fim dos jogos
e compara com as análises geradas pelo Claude.
"""

from database import supabase


async def verify_finished_games() -> int:
    """Verifica todos os jogos encerrados sem resultado verificado. Retorna quantidade processada."""
    raise NotImplementedError("Implementar na etapa de integração real")
