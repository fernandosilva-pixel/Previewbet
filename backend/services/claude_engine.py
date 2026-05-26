"""
Gera análises de jogos usando Claude API (Anthropic).
Lê contexto da memória histórica para melhorar acurácia ao longo do tempo.
"""

import json
import anthropic
from database import settings, supabase


_client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

SYSTEM_PROMPT = """Você é um especialista em análise de futebol.
Analise o jogo fornecido e retorne um JSON estruturado com resultado previsto,
análise de gols, escanteios, cartões, placares prováveis e combinações.
Seja objetivo e baseie-se nos dados estatísticos fornecidos."""


async def generate_analysis(game: dict, memory_context: str = "") -> dict:
    """Chama Claude API e retorna o JSON de análise parseado."""
    raise NotImplementedError("Implementar na etapa de integração real")


def _build_prompt(game: dict, memory_context: str) -> str:
    return f"""
{memory_context}

Jogo: {game['home_team']} vs {game['away_team']}
Liga: {game['league']}
Data: {game['datetime']}
Odds: Casa {game.get('odds_home')} | Empate {game.get('odds_draw')} | Fora {game.get('odds_away')}

Retorne apenas o JSON de análise conforme o schema definido.
"""
