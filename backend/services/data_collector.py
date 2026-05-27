"""
Coleta jogos da ESPN API (não-oficial, sem chave) e faz upsert no Supabase.

Endpoints ESPN:
  https://site.api.espn.com/apis/site/v2/sports/soccer/{league_id}/scoreboard?dates=YYYYMMDD
"""

import asyncio
from datetime import datetime, timedelta, timezone

import httpx

from database import supabase

# ---------------------------------------------------------------------------
# Ligas monitoradas
# ---------------------------------------------------------------------------

LEAGUES: list[dict] = [
    {"id": "bra.1",                 "name": "Brasileirão Série A",  "short": "SÉRIE A",   "country": "Brasil"},
    {"id": "bra.2",                 "name": "Brasileirão Série B",  "short": "SÉRIE B",   "country": "Brasil"},
    {"id": "conmebol.libertadores", "name": "Libertadores",         "short": "LIBERTAD.", "country": "CONMEBOL"},
    {"id": "conmebol.sudamericana", "name": "Sul-Americana",        "short": "SULAMER.",  "country": "CONMEBOL"},
    {"id": "eng.1",                 "name": "Premier League",       "short": "PREMIER",   "country": "Inglaterra"},
    {"id": "uefa.champions",        "name": "Champions League",     "short": "UCL",       "country": "UEFA"},
    {"id": "esp.1",                 "name": "La Liga",              "short": "LA LIGA",   "country": "Espanha"},
    {"id": "ger.1",                 "name": "Bundesliga",           "short": "BUNDESL.",  "country": "Alemanha"},
    {"id": "ita.1",                 "name": "Serie A",              "short": "SERIE A",   "country": "Itália"},
    {"id": "fra.1",                 "name": "Ligue 1",              "short": "LIGUE 1",   "country": "França"},
    {"id": "uefa.europa",           "name": "Europa League",        "short": "UEL",       "country": "UEFA"},
    {"id": "eng.fa",                "name": "FA Cup",               "short": "FA CUP",    "country": "Inglaterra"},
]

ESPN_BASE = "https://site.api.espn.com/apis/site/v2/sports/soccer"

# ESPN status → status salvo no banco
STATUS_MAP: dict[str, str] = {
    "STATUS_SCHEDULED":   "scheduled",
    "STATUS_IN_PROGRESS": "in_progress",
    "STATUS_HALFTIME":    "in_progress",
    "STATUS_FINAL":       "final",
    "STATUS_FULL_TIME":   "final",
    "STATUS_POSTPONED":   "postponed",
    "STATUS_CANCELLED":   "cancelled",
    "STATUS_SUSPENDED":   "suspended",
    "STATUS_DELAYED":     "scheduled",
}


# ---------------------------------------------------------------------------
# Parser
# ---------------------------------------------------------------------------

def _parse_event(event: dict, league: dict) -> dict | None:
    """Transforma um evento ESPN no formato da tabela `games` do Supabase."""
    try:
        competition = event["competitions"][0]
        competitors = competition["competitors"]

        home = next((c for c in competitors if c.get("homeAway") == "home"), None)
        away = next((c for c in competitors if c.get("homeAway") == "away"), None)
        if not home or not away:
            return None

        status_info = competition.get("status", {})
        status_type = status_info.get("type", {})
        espn_status = status_type.get("name", "STATUS_SCHEDULED")
        db_status   = STATUS_MAP.get(espn_status, "scheduled")
        is_scheduled = db_status == "scheduled"

        clock_val = status_info.get("displayClock", "")
        period    = status_info.get("period", 0) or 0

        home_score = int(home.get("score", 0) or 0)
        away_score = int(away.get("score", 0) or 0)

        return {
            "external_id": f"espn_{event['id']}",
            "league":      league["name"],
            "country":     league["country"],
            "home_team":   home["team"]["displayName"],
            "away_team":   away["team"]["displayName"],
            "home_logo":   home["team"].get("logo", ""),
            "away_logo":   away["team"].get("logo", ""),
            "datetime":    event["date"],
            "status":      db_status,
            "home_score":  None if is_scheduled else home_score,
            "away_score":  None if is_scheduled else away_score,
            "clock":       clock_val,
            "period":      period,
            "source":      league["id"],
            "updated_at":  datetime.now(timezone.utc).isoformat(),
        }
    except (KeyError, IndexError, TypeError) as exc:
        print(f"[collector] parse error: {exc}", flush=True)
        return None


# ---------------------------------------------------------------------------
# Fetch ESPN
# ---------------------------------------------------------------------------

async def _fetch_league_date(
    league_id: str, date: str, client: httpx.AsyncClient
) -> list[dict]:
    """GET /scoreboard para uma liga e data. Retorna eventos brutos."""
    url    = f"{ESPN_BASE}/{league_id}/scoreboard"
    params = {"dates": date, "limit": 200}
    try:
        resp = await client.get(url, params=params, timeout=12)
        resp.raise_for_status()
        return resp.json().get("events", [])
    except Exception as exc:
        print(f"[collector] {league_id} {date}: {exc}", flush=True)
        return []


# ---------------------------------------------------------------------------
# Upsert Supabase
# ---------------------------------------------------------------------------

def _upsert(rows: list[dict]) -> int:
    if not rows or supabase is None:
        return 0
    try:
        res = (
            supabase.table("games")
            .upsert(rows, on_conflict="external_id")
            .execute()
        )
        return len(res.data) if res.data else 0
    except Exception as exc:
        print(f"[collector] upsert error: {exc}", flush=True)
        return 0


# ---------------------------------------------------------------------------
# Jobs públicos — chamados pelo scheduler
# ---------------------------------------------------------------------------

async def sync_today() -> int:
    """
    Sincroniza jogos de hoje (rápido — usado a cada 2 min).
    """
    date  = datetime.now(timezone.utc).strftime("%Y%m%d")
    total = 0
    async with httpx.AsyncClient() as client:
        for league in LEAGUES:
            events = await _fetch_league_date(league["id"], date, client)
            rows   = [r for e in events if (r := _parse_event(e, league))]
            if rows:
                total += _upsert(rows)
            await asyncio.sleep(0.15)
    print(f"[collector] sync_today: {total} jogos", flush=True)
    return total


async def sync_fixtures(days_ahead: int = 2) -> int:
    """
    Sincroniza fixtures dos próximos N dias (pesado — roda a cada 3h).
    """
    now   = datetime.now(timezone.utc)
    dates = [(now + timedelta(days=i)).strftime("%Y%m%d") for i in range(days_ahead + 1)]
    total = 0
    async with httpx.AsyncClient() as client:
        for league in LEAGUES:
            for date in dates:
                events = await _fetch_league_date(league["id"], date, client)
                rows   = [r for e in events if (r := _parse_event(e, league))]
                if rows:
                    total += _upsert(rows)
                await asyncio.sleep(0.2)
    print(f"[collector] sync_fixtures ({days_ahead}d ahead): {total} jogos", flush=True)
    return total


def count_live() -> int:
    """Quantos jogos estão ao vivo no banco agora."""
    if supabase is None:
        return 0
    try:
        res = (
            supabase.table("games")
            .select("id", count="exact")
            .eq("status", "in_progress")
            .execute()
        )
        return res.count or 0
    except Exception:
        return 0
