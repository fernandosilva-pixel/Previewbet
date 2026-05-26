from datetime import date, datetime, timezone
from typing import Literal, Optional

from fastapi import APIRouter, HTTPException, Query

from mock_data import MOCK_GAMES

router = APIRouter()


def _parse_game(g: dict) -> dict:
    return g


@router.get("/games", response_model=list[dict])
async def list_games(
    date: Optional[Literal["hoje", "amanha", "encerrados"]] = Query(default="hoje"),
    league: Optional[str] = Query(default=None),
):
    today = datetime.now(timezone.utc).date()
    tomorrow = date.__class__.fromordinal(today.toordinal() + 1) if date != "encerrados" else None

    filtered = []
    for g in MOCK_GAMES:
        dt = datetime.fromisoformat(g["datetime"]).date()

        if date == "hoje" and dt == today:
            filtered.append(g)
        elif date == "amanha":
            from datetime import timedelta
            tmrw = today + timedelta(days=1)
            if dt == tmrw:
                filtered.append(g)
        elif date == "encerrados" and g["status"] == "finished":
            filtered.append(g)

    if league:
        filtered = [g for g in filtered if league.lower() in g["league"].lower()]

    # Jogos ao vivo sempre no topo
    filtered.sort(key=lambda g: (0 if g["status"] == "live" else 1, g["datetime"]))
    return filtered


@router.get("/games/{game_id}", response_model=dict)
async def get_game(game_id: int):
    for g in MOCK_GAMES:
        if g["id"] == game_id:
            return g
    raise HTTPException(status_code=404, detail="Jogo não encontrado")
