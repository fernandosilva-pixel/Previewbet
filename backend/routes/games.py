from fastapi import APIRouter, HTTPException
from mock_data import MOCK_GAMES, MOCK_LOGO_MAP

router = APIRouter()


@router.get("/games/logos/teams", response_model=dict)
async def get_logo_map():
    """Mapa de logos locais por nome de time — usado como fallback no frontend."""
    return MOCK_LOGO_MAP


@router.get("/games/", response_model=list[dict])
@router.get("/games", response_model=list[dict])
async def list_games():
    """
    Retorna TODOS os jogos de uma vez.
    O filtro por data (hoje/amanhã/encerrados) é feito no frontend.
    """
    return sorted(
        MOCK_GAMES,
        key=lambda g: (0 if g["isLive"] else 1, g["datetime"]),
    )


@router.get("/games/{game_id}", response_model=dict)
async def get_game(game_id: str):
    for g in MOCK_GAMES:
        if str(g["id"]) == game_id or g.get("espn_id") == game_id:
            return g
    raise HTTPException(status_code=404, detail="Jogo não encontrado")
