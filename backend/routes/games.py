import asyncio

from fastapi import APIRouter, HTTPException

from database import supabase
from mock_data import MOCK_GAMES, MOCK_LOGO_MAP
from services.data_collector import LEAGUE_SHORT as _LEAGUE_SHORT

router = APIRouter()

# ---------------------------------------------------------------------------
# Mapeamentos ESPN
# ---------------------------------------------------------------------------

_DB_TO_ESPN: dict[str, str] = {
    "scheduled":   "STATUS_SCHEDULED",
    "in_progress": "STATUS_IN_PROGRESS",
    "final":       "STATUS_FINAL",
    "postponed":   "STATUS_POSTPONED",
    "cancelled":   "STATUS_CANCELLED",
    "suspended":   "STATUS_SUSPENDED",
}


def _row_to_game(row: dict) -> dict:
    db_status   = row.get("status", "scheduled")
    espn_status = _DB_TO_ESPN.get(db_status, "STATUS_SCHEDULED")
    is_live     = db_status == "in_progress"
    is_final    = db_status == "final"
    league_id   = row.get("source", "")
    league_short = _LEAGUE_SHORT.get(league_id, (row.get("league") or "")[:8].upper())

    return {
        "id":          str(row["id"]),
        "espn_id":     row.get("external_id", ""),
        "home":        row.get("home_team", ""),
        "away":        row.get("away_team", ""),
        "homeLogo":    row.get("home_logo", ""),
        "awayLogo":    row.get("away_logo", ""),
        "datetime":    row.get("datetime", ""),
        "league":      row.get("league", ""),
        "leagueShort": league_short,
        "leagueId":    league_id,
        "status":      espn_status,
        "isLive":      is_live,
        "isFinal":     is_final,
        "homeScore":   row.get("home_score") or 0,
        "awayScore":   row.get("away_score") or 0,
        "clock":       row.get("clock") or "",
        "period":      row.get("period") or 0,
    }


def _fetch_games_from_supabase() -> list[dict] | None:
    """Leitura síncrona — sempre chamar via asyncio.to_thread."""
    try:
        res = (
            supabase.table("games")
            .select("*")
            .order("datetime", desc=False)
            .limit(500)
            .execute()
        )
        return res.data or []
    except Exception as exc:
        print(f"[games] Supabase read error: {exc}", flush=True)
        return None


def _fetch_game_from_supabase(game_id: str) -> dict | None:
    try:
        res = (
            supabase.table("games")
            .select("*")
            .or_(f"external_id.eq.espn_{game_id},external_id.eq.{game_id}")
            .limit(1)
            .execute()
        )
        if res.data:
            return res.data[0]
        if game_id.isdigit():
            res2 = (
                supabase.table("games")
                .select("*")
                .eq("id", int(game_id))
                .single()
                .execute()
            )
            return res2.data
    except Exception as exc:
        print(f"[games] Supabase get_game error: {exc}", flush=True)
    return None


# ---------------------------------------------------------------------------
# Rotas
# ---------------------------------------------------------------------------

@router.get("/games/logos/teams", response_model=dict)
async def get_logo_map():
    return MOCK_LOGO_MAP


@router.get("/games/", response_model=list[dict])
@router.get("/games", response_model=list[dict])
async def list_games():
    if supabase is not None:
        try:
            # Roda em thread para não bloquear o event loop; timeout de 8s
            data = await asyncio.wait_for(
                asyncio.to_thread(_fetch_games_from_supabase),
                timeout=8.0,
            )
            if data:
                games = [_row_to_game(r) for r in data]
                return sorted(games, key=lambda g: (0 if g["isLive"] else 1, g["datetime"]))
        except asyncio.TimeoutError:
            print("[games] Supabase timeout (>8s), usando mock", flush=True)
        except Exception as exc:
            print(f"[games] erro inesperado: {exc}", flush=True)

    # Fallback: mock data
    return sorted(MOCK_GAMES, key=lambda g: (0 if g["isLive"] else 1, g["datetime"]))


@router.get("/games/{game_id}", response_model=dict)
async def get_game(game_id: str):
    if supabase is not None:
        try:
            row = await asyncio.wait_for(
                asyncio.to_thread(_fetch_game_from_supabase, game_id),
                timeout=8.0,
            )
            if row:
                return _row_to_game(row)
        except asyncio.TimeoutError:
            print("[games] Supabase timeout get_game, usando mock", flush=True)
        except Exception as exc:
            print(f"[games] get_game erro: {exc}", flush=True)

    for g in MOCK_GAMES:
        if str(g["id"]) == game_id or g.get("espn_id") == game_id:
            return g
    raise HTTPException(status_code=404, detail="Jogo não encontrado")
