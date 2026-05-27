from __future__ import annotations

"""
Coleta jogos da ESPN API (não-oficial, sem chave) e faz upsert no Supabase.

Endpoint:
  https://site.api.espn.com/apis/site/v2/sports/soccer/{league_id}/scoreboard?dates=YYYYMMDD

Nota: ligas que a ESPN não cobre retornam 404/vazio e são ignoradas silenciosamente.
"""

import asyncio
from datetime import datetime, timedelta, timezone

import httpx

from database import supabase

# ---------------------------------------------------------------------------
# 124 Ligas mapeadas para IDs da ESPN
# ---------------------------------------------------------------------------

LEAGUES: list[dict] = [
    # ── BRASIL ──────────────────────────────────────────────────────────────
    {"id": "bra.1",                      "name": "Brasileirão Série A",           "short": "SÉRIE A",   "country": "Brasil"},
    {"id": "bra.2",                      "name": "Brasileirão Série B",           "short": "SÉRIE B",   "country": "Brasil"},
    {"id": "conmebol.libertadores",      "name": "Libertadores",                  "short": "LIBERTAD.", "country": "CONMEBOL"},
    {"id": "conmebol.sudamericana",      "name": "Sul-Americana",                 "short": "SULAMER.",  "country": "CONMEBOL"},
    {"id": "conmebol.recopa",            "name": "Recopa Sudamericana",           "short": "RECOPA",    "country": "CONMEBOL"},
    {"id": "conmebol.world_qualifying",  "name": "Elim. Copa do Mundo CONMEBOL", "short": "ELIM CM",   "country": "CONMEBOL"},

    # ── INGLATERRA ──────────────────────────────────────────────────────────
    {"id": "eng.1",          "name": "Premier League",   "short": "PREMIER",   "country": "Inglaterra"},
    {"id": "eng.2",          "name": "Championship",     "short": "CHAMPIO.",  "country": "Inglaterra"},
    {"id": "eng.3",          "name": "League One",       "short": "LG ONE",    "country": "Inglaterra"},
    {"id": "eng.4",          "name": "League Two",       "short": "LG TWO",    "country": "Inglaterra"},
    {"id": "eng.5",          "name": "National League",  "short": "NAT. LG",   "country": "Inglaterra"},
    {"id": "eng.fa",         "name": "FA Cup",           "short": "FA CUP",    "country": "Inglaterra"},
    {"id": "eng.league_cup", "name": "EFL Cup",          "short": "EFL CUP",   "country": "Inglaterra"},
    {"id": "eng.trophy",     "name": "EFL Trophy",       "short": "EFL TRO.",  "country": "Inglaterra"},

    # ── ESPANHA ─────────────────────────────────────────────────────────────
    {"id": "esp.1",           "name": "La Liga",              "short": "LA LIGA",  "country": "Espanha"},
    {"id": "esp.2",           "name": "La Liga 2",            "short": "LIGA 2",   "country": "Espanha"},
    {"id": "esp.copa_del_rey","name": "Copa del Rey",         "short": "COPA REY", "country": "Espanha"},
    {"id": "esp.super_cup",   "name": "Supercopa de España",  "short": "SUPERC.",  "country": "Espanha"},

    # ── ITÁLIA ──────────────────────────────────────────────────────────────
    {"id": "ita.1",           "name": "Serie A",              "short": "SERIE A",  "country": "Itália"},
    {"id": "ita.2",           "name": "Serie B",              "short": "SERIE B",  "country": "Itália"},
    {"id": "ita.coppa_italia","name": "Coppa Italia",         "short": "COPPA IT", "country": "Itália"},
    {"id": "ita.super_cup",   "name": "Supercoppa Italiana",  "short": "IT. SC",   "country": "Itália"},

    # ── ALEMANHA ────────────────────────────────────────────────────────────
    {"id": "ger.1",        "name": "Bundesliga",   "short": "BUNDESL.", "country": "Alemanha"},
    {"id": "ger.2",        "name": "2. Bundesliga","short": "BUND. 2",  "country": "Alemanha"},
    {"id": "ger.3",        "name": "3. Liga",      "short": "3. LIGA",  "country": "Alemanha"},
    {"id": "ger.dfb_pokal","name": "DFB Pokal",    "short": "DFB POK.", "country": "Alemanha"},
    {"id": "ger.super_cup","name": "DFL-Supercup", "short": "DFL SUP.", "country": "Alemanha"},

    # ── FRANÇA ──────────────────────────────────────────────────────────────
    {"id": "fra.1",                "name": "Ligue 1",            "short": "LIGUE 1",  "country": "França"},
    {"id": "fra.2",                "name": "Ligue 2",            "short": "LIGUE 2",  "country": "França"},
    {"id": "fra.3",                "name": "National",           "short": "NATIONAL", "country": "França"},
    {"id": "fra.league_cup",       "name": "Coupe de la Ligue",  "short": "CDL LIG",  "country": "França"},
    {"id": "fra.coupe_de_france",  "name": "Coupe de France",    "short": "CDL FRA",  "country": "França"},

    # ── PORTUGAL ────────────────────────────────────────────────────────────
    {"id": "por.1",         "name": "Primeira Liga",    "short": "1ª LIGA",  "country": "Portugal"},
    {"id": "por.2",         "name": "Liga Portugal 2",  "short": "LIGA 2",   "country": "Portugal"},
    {"id": "por.league_cup","name": "Taça da Liga",     "short": "TAÇA LG",  "country": "Portugal"},
    {"id": "por.cup",       "name": "Taça de Portugal", "short": "TAÇA PT",  "country": "Portugal"},

    # ── HOLANDA ─────────────────────────────────────────────────────────────
    {"id": "ned.1",   "name": "Eredivisie",             "short": "EREDIV.",  "country": "Holanda"},
    {"id": "ned.2",   "name": "Keuken Kampioen Div.",   "short": "KKD",      "country": "Holanda"},
    {"id": "ned.cup", "name": "KNVB Beker",             "short": "KNVB",     "country": "Holanda"},

    # ── BÉLGICA ─────────────────────────────────────────────────────────────
    {"id": "bel.1", "name": "Pro League",              "short": "PRO LG",   "country": "Bélgica"},
    {"id": "bel.2", "name": "Challenger Pro League",   "short": "CHALLNG",  "country": "Bélgica"},

    # ── TURQUIA ─────────────────────────────────────────────────────────────
    {"id": "tur.1", "name": "Süper Lig",   "short": "SÜPER",  "country": "Turquia"},
    {"id": "tur.2", "name": "TFF 1. Lig",  "short": "TFF 1",  "country": "Turquia"},

    # ── DEMAIS EUROPEUS ─────────────────────────────────────────────────────
    {"id": "rus.1", "name": "Premier League (Rússia)",      "short": "RPL",      "country": "Rússia"},
    {"id": "gre.1", "name": "Super League (Grécia)",        "short": "SUPER LG", "country": "Grécia"},
    {"id": "aut.1", "name": "Bundesliga (Áustria)",         "short": "AUT. BL",  "country": "Áustria"},
    {"id": "cze.1", "name": "Fortuna Liga",                 "short": "FORTUNA",  "country": "Rep. Checa"},
    {"id": "den.1", "name": "Superligaen",                  "short": "SUPERLIG", "country": "Dinamarca"},
    {"id": "den.2", "name": "Division (Dinamarca)",         "short": "DEN. D1",  "country": "Dinamarca"},
    {"id": "swe.1", "name": "Allsvenskan",                  "short": "ALLSV.",   "country": "Suécia"},
    {"id": "swe.2", "name": "SuperEttan",                   "short": "SUPERETT", "country": "Suécia"},
    {"id": "nor.1", "name": "Eliteserien",                  "short": "ELITES.",  "country": "Noruega"},
    {"id": "nor.2", "name": "Division (Noruega)",           "short": "NOR. D1",  "country": "Noruega"},
    {"id": "svk.1", "name": "Fortuna Liga (Eslováquia)",    "short": "SVK 1",    "country": "Eslováquia"},
    {"id": "rou.1", "name": "Liga I",                       "short": "LIGA I",   "country": "Romênia"},
    {"id": "sui.1", "name": "Super League (Suíça)",         "short": "SUI SL",   "country": "Suíça"},
    {"id": "sui.2", "name": "Challenge League",             "short": "SUI CL",   "country": "Suíça"},
    {"id": "sco.1", "name": "Scottish Premiership",         "short": "SCO PREM", "country": "Escócia"},
    {"id": "sco.2", "name": "Scottish Championship",        "short": "SCO CH.",  "country": "Escócia"},
    {"id": "cro.1", "name": "HNL",                          "short": "HNL",      "country": "Croácia"},
    {"id": "srb.1", "name": "SuperLiga (Sérvia)",           "short": "SRB SL",   "country": "Sérvia"},
    {"id": "pol.1", "name": "Ekstraklasa",                  "short": "EKSTRA.",  "country": "Polônia"},
    {"id": "ukr.1", "name": "Premier League (Ucrânia)",     "short": "UKR PL",   "country": "Ucrânia"},
    {"id": "hun.1", "name": "NB I",                         "short": "NB I",     "country": "Hungria"},
    {"id": "aze.1", "name": "Premier Liqası",               "short": "AZE PL",   "country": "Azerbaijão"},
    {"id": "kaz.1", "name": "Premier League (Cazaquistão)", "short": "KAZ PL",   "country": "Cazaquistão"},
    {"id": "blr.1", "name": "Premier League (Bielorrússia)","short": "BLR PL",   "country": "Bielorrússia"},
    {"id": "irl.1", "name": "Premier Division",             "short": "IRL PD",   "country": "Irlanda"},

    # ── AMÉRICAS ────────────────────────────────────────────────────────────
    {"id": "arg.1",   "name": "Liga Profesional (Argentina)",  "short": "LIG. ARG", "country": "Argentina"},
    {"id": "arg.2",   "name": "Nacional B",                    "short": "NAC. B",   "country": "Argentina"},
    {"id": "arg.copa","name": "Copa Argentina",                "short": "COPA ARG", "country": "Argentina"},
    {"id": "chi.1",   "name": "Primera División (Chile)",      "short": "CHI 1",    "country": "Chile"},
    {"id": "chi.2",   "name": "Segunda División (Chile)",      "short": "CHI 2",    "country": "Chile"},
    {"id": "col.1",   "name": "Primera A",                     "short": "COL 1A",   "country": "Colômbia"},
    {"id": "col.2",   "name": "Primera B",                     "short": "COL 1B",   "country": "Colômbia"},
    {"id": "ecu.1",   "name": "LigaPro",                       "short": "LIGAPRO",  "country": "Equador"},
    {"id": "ecu.2",   "name": "Serie B (Equador)",             "short": "ECU B",    "country": "Equador"},
    {"id": "par.1",   "name": "Primera División (Paraguai)",   "short": "PAR 1",    "country": "Paraguai"},
    {"id": "par.2",   "name": "Segunda División (Paraguai)",   "short": "PAR 2",    "country": "Paraguai"},
    {"id": "uru.1",   "name": "Liga AUF",                      "short": "URU 1",    "country": "Uruguai"},
    {"id": "uru.2",   "name": "Segunda División (Uruguai)",    "short": "URU 2",    "country": "Uruguai"},
    {"id": "ven.1",   "name": "Primera División (Venezuela)",  "short": "VEN 1",    "country": "Venezuela"},
    {"id": "ven.2",   "name": "Segunda División (Venezuela)",  "short": "VEN 2",    "country": "Venezuela"},
    {"id": "per.1",   "name": "Liga 1",                        "short": "LIG. 1",   "country": "Peru"},
    {"id": "per.2",   "name": "Segunda División (Peru)",       "short": "PER 2",    "country": "Peru"},
    {"id": "bol.1",   "name": "Liga Profesional (Bolívia)",    "short": "BOL 1",    "country": "Bolívia"},
    {"id": "mex.1",              "name": "Liga BBVA MX",           "short": "LIGA MX",  "country": "México"},
    {"id": "mex.2",              "name": "Liga de Expansión",      "short": "EXPAN.",   "country": "México"},
    {"id": "concacaf.champions", "name": "Champions Cup CONCACAF", "short": "CONCAF.",  "country": "CONCACAF"},
    {"id": "usa.1",              "name": "MLS",                    "short": "MLS",      "country": "EUA"},
    {"id": "usa.open",           "name": "U.S. Open Cup",          "short": "US OPEN",  "country": "EUA"},

    # ── MÉDIO ORIENTE / AFRICA ──────────────────────────────────────────────
    {"id": "sau.1",                "name": "Saudi Pro League",         "short": "SAUDI",    "country": "Arábia Saudita"},
    {"id": "egy.1",                "name": "Premier League (Egito)",   "short": "EGY PL",   "country": "Egito"},
    {"id": "uae.1",                "name": "Arabian Gulf League",      "short": "AGL",      "country": "EAU"},
    {"id": "irn.1",                "name": "Persian Gulf Pro League",  "short": "PGPL",     "country": "Irã"},
    {"id": "isr.1",                "name": "Premier League (Israel)",  "short": "ISR PL",   "country": "Israel"},
    {"id": "caf.nations",          "name": "Copa Africana de Nações",  "short": "AFCON",    "country": "CAF"},
    {"id": "caf.champions",        "name": "Champions League CAF",     "short": "CAF CL",   "country": "CAF"},
    {"id": "caf.world_qualifying", "name": "Elim. Copa CAF",           "short": "ELIM CAF", "country": "CAF"},

    # ── ÁSIA / OCEANIA ──────────────────────────────────────────────────────
    {"id": "jpn.1",             "name": "J-League",                "short": "J1 LG",    "country": "Japão"},
    {"id": "kor.1",             "name": "K-League",                "short": "K1 LG",    "country": "Coreia do Sul"},
    {"id": "chn.1",             "name": "Super League (China)",    "short": "CSL",      "country": "China"},
    {"id": "aus.1",             "name": "A-League Men",            "short": "A-LG",     "country": "Austrália"},
    {"id": "ind.1",             "name": "Super League (Índia)",    "short": "ISL",      "country": "Índia"},
    {"id": "afc.asian_cup",     "name": "Copa da Ásia",            "short": "AFC CUP",  "country": "AFC"},
    {"id": "afc.champions",     "name": "AFC Champions League",    "short": "AFC CL",   "country": "AFC"},
    {"id": "afc.world_qualifying","name": "Elim. Copa AFC",        "short": "ELIM AFC", "country": "AFC"},

    # ── UEFA / FIFA ─────────────────────────────────────────────────────────
    {"id": "uefa.champions",           "name": "Champions League",           "short": "UCL",      "country": "UEFA"},
    {"id": "uefa.europa",              "name": "Europa League",              "short": "UEL",      "country": "UEFA"},
    {"id": "uefa.europa.conference",   "name": "Conference League",          "short": "UECL",     "country": "UEFA"},
    {"id": "uefa.nations",             "name": "UEFA Nations League",        "short": "UNL",      "country": "UEFA"},
    {"id": "uefa.euro",                "name": "Eurocopa",                   "short": "EURO",     "country": "UEFA"},
    {"id": "uefa.euro.qualifying",     "name": "Elim. Eurocopa",             "short": "EURO Q",   "country": "UEFA"},
    {"id": "uefa.super_cup",           "name": "Supercopa UEFA",             "short": "UEFA SC",  "country": "UEFA"},
    {"id": "fifa.cwc",                 "name": "Mundial de Clubes",          "short": "CLUB WC",  "country": "FIFA"},
    {"id": "fifa.world",               "name": "Copa do Mundo",              "short": "COPA MU",  "country": "FIFA"},
    {"id": "concacaf.world_qualifying","name": "Elim. Copa CONCACAF",        "short": "ELIM CC",  "country": "CONCACAF"},
    {"id": "concacaf.nations",         "name": "Nations League CONCACAF",    "short": "CNL",      "country": "CONCACAF"},
    {"id": "concacaf.gold",            "name": "Gold Cup",                   "short": "GOLD CUP", "country": "CONCACAF"},
    {"id": "conmebol.america",         "name": "Copa América",               "short": "COPA AM",  "country": "CONMEBOL"},
    {"id": "fifa.friendly",            "name": "Amistosos Internacionais",   "short": "AMISTOSO", "country": "FIFA"},
]

# lookup rápido: id → short (usado no routes/games.py)
LEAGUE_SHORT: dict[str, str] = {lg["id"]: lg["short"] for lg in LEAGUES}
LEAGUE_NAME:  dict[str, str] = {lg["id"]: lg["name"]  for lg in LEAGUES}

# ---------------------------------------------------------------------------
# Constantes
# ---------------------------------------------------------------------------

ESPN_BASE = "https://site.api.espn.com/apis/site/v2/sports/soccer"

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

# Máximo de requests simultâneos à ESPN (evita ban)
_SEM = asyncio.Semaphore(8)


# ---------------------------------------------------------------------------
# Parser
# ---------------------------------------------------------------------------

def _parse_event(event: dict, league: dict) -> dict | None:
    try:
        competition = event["competitions"][0]
        competitors = competition["competitors"]

        home = next((c for c in competitors if c.get("homeAway") == "home"), None)
        away = next((c for c in competitors if c.get("homeAway") == "away"), None)
        if not home or not away:
            return None

        status_info  = competition.get("status", {})
        espn_status  = status_info.get("type", {}).get("name", "STATUS_SCHEDULED")
        db_status    = STATUS_MAP.get(espn_status, "scheduled")
        is_scheduled = db_status == "scheduled"

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
            "home_score":  None if is_scheduled else int(home.get("score", 0) or 0),
            "away_score":  None if is_scheduled else int(away.get("score", 0) or 0),
            "clock":       status_info.get("displayClock", ""),
            "period":      status_info.get("period", 0) or 0,
            "source":      league["id"],
            "updated_at":  datetime.now(timezone.utc).isoformat(),
        }
    except (KeyError, IndexError, TypeError) as exc:
        print(f"[collector] parse error ({league['id']}): {exc}", flush=True)
        return None


# ---------------------------------------------------------------------------
# Fetch ESPN (com semáforo)
# ---------------------------------------------------------------------------

async def _fetch(league_id: str, date: str, client: httpx.AsyncClient) -> list[dict]:
    async with _SEM:
        url    = f"{ESPN_BASE}/{league_id}/scoreboard"
        params = {"dates": date, "limit": 200}
        try:
            resp = await client.get(url, params=params, timeout=10)
            if resp.status_code == 404:
                return []          # liga não coberta pela ESPN — ignora
            resp.raise_for_status()
            return resp.json().get("events", [])
        except Exception as exc:
            print(f"[collector] {league_id} {date}: {exc}", flush=True)
            return []


# ---------------------------------------------------------------------------
# Upsert Supabase — síncrono (rodado em thread para não bloquear event loop)
# ---------------------------------------------------------------------------

def _upsert_sync(rows: list[dict]) -> int:
    """Upsert síncrono — SEMPRE chamar via asyncio.to_thread()."""
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


async def _upsert(rows: list[dict]) -> int:
    """Wrapper async — roda o upsert em thread pool para não travar o event loop."""
    if not rows:
        return 0
    return await asyncio.to_thread(_upsert_sync, rows)


# ---------------------------------------------------------------------------
# Jobs públicos
# ---------------------------------------------------------------------------

async def sync_today() -> int:
    """
    Sincroniza jogos de HOJE em paralelo (~3s para 124 ligas).
    Chamado a cada 3 minutos pelo scheduler.
    """
    date  = datetime.now(timezone.utc).strftime("%Y%m%d")
    total = 0

    async with httpx.AsyncClient() as client:
        tasks   = [_fetch(lg["id"], date, client) for lg in LEAGUES]
        results = await asyncio.gather(*tasks)

    # Agrupa tudo em um único upsert por data (menos chamadas ao Supabase)
    all_rows = []
    for league, events in zip(LEAGUES, results):
        all_rows += [r for e in events if (r := _parse_event(e, league))]

    if all_rows:
        total = await _upsert(all_rows)

    print(f"[collector] sync_today: {total} jogos", flush=True)
    return total


async def sync_fixtures(days_ahead: int = 2) -> int:
    """
    Sincroniza fixtures dos próximos N dias em paralelo.
    Chamado no startup e a cada 3 horas.
    """
    now   = datetime.now(timezone.utc)
    dates = [(now + timedelta(days=i)).strftime("%Y%m%d") for i in range(days_ahead + 1)]
    total = 0

    async with httpx.AsyncClient() as client:
        for date in dates:
            tasks   = [_fetch(lg["id"], date, client) for lg in LEAGUES]
            results = await asyncio.gather(*tasks)

            # Um único upsert por data (não bloqueia o event loop)
            day_rows = []
            for league, events in zip(LEAGUES, results):
                day_rows += [r for e in events if (r := _parse_event(e, league))]

            if day_rows:
                count = await _upsert(day_rows)
                total += count
                print(f"[collector] {date}: {count} jogos salvos", flush=True)

    print(f"[collector] sync_fixtures ({days_ahead}d): {total} jogos total", flush=True)
    return total


def count_live() -> int:
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
