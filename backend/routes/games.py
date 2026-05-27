from fastapi import APIRouter, HTTPException

from database import supabase
from mock_data import MOCK_GAMES, MOCK_LOGO_MAP

router = APIRouter()

# ---------------------------------------------------------------------------
# Mapeamentos ESPN
# ---------------------------------------------------------------------------

# status do banco → status ESPN esperado pelo frontend
_DB_TO_ESPN: dict[str, str] = {
    "scheduled":  "STATUS_SCHEDULED",
    "in_progress": "STATUS_IN_PROGRESS",
    "final":      "STATUS_FINAL",
    "postponed":  "STATUS_POSTPONED",
    "cancelled":  "STATUS_CANCELLED",
    "suspended":  "STATUS_SUSPENDED",
}

# source (espn league id) → short name
_LEAGUE_SHORT: dict[str, str] = {
    "bra.1":                 "SÉRIE A",
    "bra.2":                 "SÉRIE B",
    "conmebol.libertadores": "LIBERTAD.",
    "conmebol.sudamericana": "SULAMER.",
    "eng.1":                 "PREMIER",
    "uefa.champions":        "UCL",
    "esp.1":                 "LA LIGA",
    "ger.1":                 "BUNDESL.",
    "ita.1":                 "SERIE A",
    "fra.1":                 "LIGUE 1",
    "uefa.europa":           "UEL",
    "eng.fa":                "FA CUP",
}


def _row_to_game(row: dict) -> dict:
    """Converte linha do Supabase no formato Game esperado pelo frontend."""
    db_status  = row.get("status", "scheduled")
    espn_status = _DB_TO_ESPN.get(db_status, "STATUS_SCHEDULED")
    is_live    = db_status == "in_progress"
    is_final   = db_status == "final"

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


# ---------------------------------------------------------------------------
# Rotas
# ---------------------------------------------------------------------------

@router.get("/games/logos/teams", response_model=dict)
async def get_logo_map():
    """Mapa de logos locais por nome de time — usado como fallback no frontend."""
    return MOCK_LOGO_MAP


@router.get("/games/", response_model=list[dict])
@router.get("/games", response_model=list[dict])
async def list_games():
    """
    Retorna TODOS os jogos.
    Prioridade: Supabase → mock_data (fallback de desenvolvimento).
    O filtro por data é feito no frontend.
    """
    if supabase is not None:
        try:
            res = (
                supabase.table("games")
                .select("*")
                .order("datetime", desc=False)
                .limit(500)
                .execute()
            )
            if res.data:
                games = [_row_to_game(r) for r in res.data]
                return sorted(
                    games,
                    key=lambda g: (0 if g["isLive"] else 1, g["datetime"]),
                )
        except Exception as exc:
            print(f"[games] Supabase error, usando mock: {exc}", flush=True)

    # Fallback: mock data (desenvolvimento sem Supabase configurado)
    return sorted(MOCK_GAMES, key=lambda g: (0 if g["isLive"] else 1, g["datetime"]))


@router.get("/games/{game_id}", response_model=dict)
async def get_game(game_id: str):
    if supabase is not None:
        try:
            # Tenta por id numérico ou por external_id
            res = (
                supabase.table("games")
                .select("*")
                .or_(
                    f"external_id.eq.espn_{game_id},"
                    f"external_id.eq.{game_id}"
                )
                .limit(1)
                .execute()
            )
            if res.data:
                return _row_to_game(res.data[0])

            # Se não achou por external_id, tenta id numérico
            if game_id.isdigit():
                res2 = (
                    supabase.table("games")
                    .select("*")
                    .eq("id", int(game_id))
                    .single()
                    .execute()
                )
                if res2.data:
                    return _row_to_game(res2.data)
        except Exception as exc:
            print(f"[games] get_game error: {exc}", flush=True)

    # Fallback mock
    for g in MOCK_GAMES:
        if str(g["id"]) == game_id or g.get("espn_id") == game_id:
            return g
    raise HTTPException(status_code=404, detail="Jogo não encontrado")
