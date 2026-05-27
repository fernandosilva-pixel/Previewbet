"""
Dados mockados no formato ESPN — compatível com o frontend atual.
"""

from datetime import datetime, timedelta, timezone

_now = datetime.now(timezone.utc)
_today = _now.replace(hour=0, minute=0, second=0, microsecond=0)


def _dt(days=0, hour=15, minute=0):
    d = (_today + timedelta(days=days)).replace(hour=hour, minute=minute)
    return d.isoformat()


MOCK_GAMES = [
    # ---- AO VIVO ----
    {
        "id": "e_1001",
        "espn_id": "e_1001",
        "home": "Flamengo",
        "away": "Palmeiras",
        "homeLogo": "https://a.espncdn.com/i/teamlogos/soccer/500/5781.png",
        "awayLogo": "https://a.espncdn.com/i/teamlogos/soccer/500/5783.png",
        "datetime": _dt(0, 16, 0),
        "league": "Brasileirão Série A",
        "leagueShort": "Brasileirão",
        "leagueId": "bra.1",
        "status": "STATUS_IN_PROGRESS",
        "isLive": True,
        "isFinal": False,
        "homeScore": 1,
        "awayScore": 0,
        "clock": "67'",
        "period": 2,
    },
    {
        "id": "e_1002",
        "espn_id": "e_1002",
        "home": "Real Madrid",
        "away": "Barcelona",
        "homeLogo": "https://a.espncdn.com/i/teamlogos/soccer/500/86.png",
        "awayLogo": "https://a.espncdn.com/i/teamlogos/soccer/500/83.png",
        "datetime": _dt(0, 17, 0),
        "league": "La Liga",
        "leagueShort": "La Liga",
        "leagueId": "esp.1",
        "status": "STATUS_IN_PROGRESS",
        "isLive": True,
        "isFinal": False,
        "homeScore": 2,
        "awayScore": 2,
        "clock": "78'",
        "period": 2,
    },
    # ---- HOJE ----
    {
        "id": "e_1003",
        "espn_id": "e_1003",
        "home": "Corinthians",
        "away": "São Paulo",
        "homeLogo": "https://a.espncdn.com/i/teamlogos/soccer/500/5793.png",
        "awayLogo": "https://a.espncdn.com/i/teamlogos/soccer/500/5786.png",
        "datetime": _dt(0, 19, 30),
        "league": "Brasileirão Série A",
        "leagueShort": "Brasileirão",
        "leagueId": "bra.1",
        "status": "STATUS_SCHEDULED",
        "isLive": False,
        "isFinal": False,
        "homeScore": 0,
        "awayScore": 0,
        "clock": "0'",
        "period": 0,
    },
    {
        "id": "e_1004",
        "espn_id": "e_1004",
        "home": "River Plate",
        "away": "Boca Juniors",
        "homeLogo": "https://a.espncdn.com/i/teamlogos/soccer/500/16.png",
        "awayLogo": "https://a.espncdn.com/i/teamlogos/soccer/500/17.png",
        "datetime": _dt(0, 21, 0),
        "league": "CONMEBOL Libertadores",
        "leagueShort": "Libertadores",
        "leagueId": "conmebol.libertadores",
        "status": "STATUS_SCHEDULED",
        "isLive": False,
        "isFinal": False,
        "homeScore": 0,
        "awayScore": 0,
        "clock": "0'",
        "period": 0,
    },
    {
        "id": "e_1005",
        "espn_id": "e_1005",
        "home": "Manchester City",
        "away": "Arsenal",
        "homeLogo": "https://a.espncdn.com/i/teamlogos/soccer/500/382.png",
        "awayLogo": "https://a.espncdn.com/i/teamlogos/soccer/500/359.png",
        "datetime": _dt(0, 16, 0),
        "league": "Premier League",
        "leagueShort": "Premier League",
        "leagueId": "eng.1",
        "status": "STATUS_SCHEDULED",
        "isLive": False,
        "isFinal": False,
        "homeScore": 0,
        "awayScore": 0,
        "clock": "0'",
        "period": 0,
    },
    {
        "id": "e_1006",
        "espn_id": "e_1006",
        "home": "Inter de Milão",
        "away": "AC Milan",
        "homeLogo": "https://a.espncdn.com/i/teamlogos/soccer/500/110.png",
        "awayLogo": "https://a.espncdn.com/i/teamlogos/soccer/500/103.png",
        "datetime": _dt(0, 18, 45),
        "league": "Serie A",
        "leagueShort": "Serie A",
        "leagueId": "ita.1",
        "status": "STATUS_SCHEDULED",
        "isLive": False,
        "isFinal": False,
        "homeScore": 0,
        "awayScore": 0,
        "clock": "0'",
        "period": 0,
    },
    # ---- AMANHÃ ----
    {
        "id": "e_1007",
        "espn_id": "e_1007",
        "home": "Atlético Mineiro",
        "away": "Fluminense",
        "homeLogo": "https://a.espncdn.com/i/teamlogos/soccer/500/1105.png",
        "awayLogo": "https://a.espncdn.com/i/teamlogos/soccer/500/5788.png",
        "datetime": _dt(1, 20, 0),
        "league": "Brasileirão Série A",
        "leagueShort": "Brasileirão",
        "leagueId": "bra.1",
        "status": "STATUS_SCHEDULED",
        "isLive": False,
        "isFinal": False,
        "homeScore": 0,
        "awayScore": 0,
        "clock": "0'",
        "period": 0,
    },
    {
        "id": "e_1008",
        "espn_id": "e_1008",
        "home": "Atlético de Madrid",
        "away": "Sevilla",
        "homeLogo": "https://a.espncdn.com/i/teamlogos/soccer/500/1068.png",
        "awayLogo": "https://a.espncdn.com/i/teamlogos/soccer/500/243.png",
        "datetime": _dt(1, 16, 0),
        "league": "La Liga",
        "leagueShort": "La Liga",
        "leagueId": "esp.1",
        "status": "STATUS_SCHEDULED",
        "isLive": False,
        "isFinal": False,
        "homeScore": 0,
        "awayScore": 0,
        "clock": "0'",
        "period": 0,
    },
    {
        "id": "e_1009",
        "espn_id": "e_1009",
        "home": "Liverpool",
        "away": "Chelsea",
        "homeLogo": "https://a.espncdn.com/i/teamlogos/soccer/500/364.png",
        "awayLogo": "https://a.espncdn.com/i/teamlogos/soccer/500/363.png",
        "datetime": _dt(1, 17, 30),
        "league": "Premier League",
        "leagueShort": "Premier League",
        "leagueId": "eng.1",
        "status": "STATUS_SCHEDULED",
        "isLive": False,
        "isFinal": False,
        "homeScore": 0,
        "awayScore": 0,
        "clock": "0'",
        "period": 0,
    },
    # ---- ENCERRADOS ----
    {
        "id": "e_1010",
        "espn_id": "e_1010",
        "home": "Santos",
        "away": "Grêmio",
        "homeLogo": "https://a.espncdn.com/i/teamlogos/soccer/500/5780.png",
        "awayLogo": "https://a.espncdn.com/i/teamlogos/soccer/500/5784.png",
        "datetime": _dt(-1, 19, 0),
        "league": "Brasileirão Série A",
        "leagueShort": "Brasileirão",
        "leagueId": "bra.1",
        "status": "STATUS_FINAL",
        "isLive": False,
        "isFinal": True,
        "homeScore": 2,
        "awayScore": 1,
        "clock": "90'",
        "period": 2,
    },
]

# ---------------------------------------------------------------------------
# Mapa de logos locais (fallback)
# ---------------------------------------------------------------------------

MOCK_LOGO_MAP: dict[str, str] = {
    "Flamengo": "/static/logos/flamengo.png",
    "Palmeiras": "/static/logos/palmeiras.png",
    "Corinthians": "/static/logos/corinthians.png",
    "São Paulo": "/static/logos/sao_paulo.png",
    "Santos": "/static/logos/santos.png",
    "Grêmio": "/static/logos/gremio.png",
    "Fluminense": "/static/logos/fluminense.png",
    "Atlético Mineiro": "/static/logos/atletico_mg.png",
    "Real Madrid": "/static/logos/real_madrid.png",
    "Barcelona": "/static/logos/barcelona.png",
    "Atlético de Madrid": "/static/logos/atletico_madrid.png",
    "Sevilla": "/static/logos/sevilla.png",
    "Manchester City": "/static/logos/manchester_city.png",
    "Arsenal": "/static/logos/arsenal.png",
    "Liverpool": "/static/logos/liverpool.png",
    "Chelsea": "/static/logos/chelsea.png",
    "Inter de Milão": "/static/logos/inter.png",
    "AC Milan": "/static/logos/milan.png",
    "River Plate": "/static/logos/river_plate.png",
    "Boca Juniors": "/static/logos/boca_juniors.png",
}

# ---------------------------------------------------------------------------
# Análises mock (mantidas para compatibilidade)
# ---------------------------------------------------------------------------

MOCK_ANALYSES = {
    "e_1001": {
        "id": 1,
        "game_id": "e_1001",
        "resultado": {
            "r": "Casa",
            "c": "ALTA",
            "just": "Flamengo tem melhor aproveitamento em casa nesta temporada.",
            "ins": "Histórico recente favorece o time da casa.",
            "fc": "VVDVE",
            "ff": "DVVDD",
            "fca": 8.2,
            "ffo": 6.8,
            "fav": "Flamengo",
        },
        "gols": {
            "mk": "Mais de 2.5",
            "cf": "MEDIA",
            "te": "2.8",
            "am": "Sim",
            "nt": "Ambos times têm ataque forte.",
        },
        "escanteios": {"mk": "Mais de 9.5", "cf": "ALTA", "te": "10.3"},
        "cartoes": {"mk": "Mais de 3.5", "cf": "MEDIA", "te": "3.8"},
        "placar": {
            "mg": 5,
            "st": "Aberto",
            "pls": [{"p": "2-1", "v": "22%"}, {"p": "1-0", "v": "18%"}],
        },
        "combinacoes": {
            "conservador": "Flamengo Vence + Mais de 1.5 gols",
            "moderado": "Flamengo Vence + Ambas marcam",
            "ousado": "Flamengo Vence + Mais de 3.5 gols",
        },
        "created_at": _now.isoformat() if isinstance(_now, datetime) else _now,
    },
    "e_1002": {
        "id": 2,
        "game_id": "e_1002",
        "resultado": {
            "r": "Empate",
            "c": "MEDIA",
            "just": "El Clásico historicamente equilibrado.",
            "ins": "Última vez terminou 1-1.",
            "fc": "VEVVD",
            "ff": "VVDEV",
            "fca": 8.5,
            "ffo": 9.0,
            "fav": "Barcelona",
        },
        "gols": {
            "mk": "Mais de 2.5",
            "cf": "ALTA",
            "te": "3.2",
            "am": "Sim",
            "nt": "Os dois melhores ataques da liga.",
        },
        "escanteios": {"mk": "Mais de 10.5", "cf": "MEDIA", "te": "11.0"},
        "cartoes": {"mk": "Mais de 4.5", "cf": "ALTA", "te": "5.1"},
        "placar": {
            "mg": 5,
            "st": "Aberto",
            "pls": [{"p": "2-2", "v": "19%"}, {"p": "1-1", "v": "17%"}],
        },
        "combinacoes": {
            "conservador": "Empate ou Barcelona Vence + Mais de 2.5",
            "moderado": "Ambas marcam + Mais de 3.5 gols",
            "ousado": "Placar exato 2-2",
        },
        "created_at": _now.isoformat() if isinstance(_now, datetime) else _now,
    },
}

# ---------------------------------------------------------------------------
# Stats mock
# ---------------------------------------------------------------------------

MOCK_STATS = [
    {
        "league": "Geral",
        "total": 248,
        "correct": 173,
        "accuracy_pct": 69.8,
        "by_confidence": {
            "ALTA": {"total": 82, "correct": 68, "pct": 82.9},
            "MEDIA": {"total": 110, "correct": 76, "pct": 69.1},
            "BAIXA": {"total": 56, "correct": 29, "pct": 51.8},
        },
    },
    {
        "league": "Brasileirão Série A",
        "total": 96,
        "correct": 71,
        "accuracy_pct": 74.0,
        "by_confidence": {
            "ALTA": {"total": 34, "correct": 30, "pct": 88.2},
            "MEDIA": {"total": 42, "correct": 30, "pct": 71.4},
            "BAIXA": {"total": 20, "correct": 11, "pct": 55.0},
        },
    },
    {
        "league": "Premier League",
        "total": 52,
        "correct": 36,
        "accuracy_pct": 69.2,
        "by_confidence": {
            "ALTA": {"total": 18, "correct": 15, "pct": 83.3},
            "MEDIA": {"total": 24, "correct": 16, "pct": 66.7},
            "BAIXA": {"total": 10, "correct": 5, "pct": 50.0},
        },
    },
]

# ---------------------------------------------------------------------------
# Bingos mock
# ---------------------------------------------------------------------------

MOCK_BINGOS = [
    {
        "id": 1,
        "name": "Combo Sábado Premium",
        "category": "conservador",
        "tier": "seguro",
        "total_odd": 4.85,
        "confidence_pct": 78,
        "is_active": True,
        "created_at": _now.isoformat(),
        "selections": [
            {
                "home": "Flamengo",
                "away": "Palmeiras",
                "league": "Brasileirão Série A",
                "datetime": _dt(0, 16, 0),
                "market_label": "Flamengo Vence",
                "odd": 2.10,
                "confidence": "ALTA",
                "sub_picks": [{"market_label": "Mais de 1.5 gols", "odd": 1.40}],
            },
            {
                "home": "Manchester City",
                "away": "Arsenal",
                "league": "Premier League",
                "datetime": _dt(0, 16, 0),
                "market_label": "Manchester City Vence",
                "odd": 1.85,
                "confidence": "ALTA",
                "sub_picks": [{"market_label": "Mais de 2.5 gols", "odd": 1.65}],
            },
        ],
    },
    {
        "id": 2,
        "name": "Super Gols Europeu",
        "category": "moderado",
        "tier": "moderado",
        "total_odd": 9.20,
        "confidence_pct": 62,
        "is_active": True,
        "created_at": _now.isoformat(),
        "selections": [
            {
                "home": "Real Madrid",
                "away": "Barcelona",
                "league": "La Liga",
                "datetime": _dt(0, 17, 0),
                "market_label": "Ambas marcam",
                "odd": 1.60,
                "confidence": "ALTA",
                "sub_picks": [{"market_label": "Mais de 2.5 gols", "odd": 1.55}],
            },
        ],
    },
]

# ---------------------------------------------------------------------------
# Live alerts mock
# ---------------------------------------------------------------------------

MOCK_LIVE_ALERTS = [
    {
        "id": 1,
        "game_id": "e_1001",
        "league": "Brasileirão Série A",
        "home": "Flamengo",
        "away": "Palmeiras",
        "home_score": 1,
        "away_score": 0,
        "clock": "67'",
        "market": "Próximo gol - Casa",
        "signal": "Flamengo domina com 54% de posse e criou 3 chances claras nos últimos 10 minutos.",
        "confidence": "ALTA",
        "triggered_at": _now.isoformat(),
        "is_active": True,
        "pressure": {
            "possession": "54%",
            "shots": "8",
            "corners": "4",
            "pressure_score": "8.2/10",
            "green_condition": "Pressão alta sustentada",
        },
    },
    {
        "id": 2,
        "game_id": "e_1002",
        "league": "La Liga",
        "home": "Real Madrid",
        "away": "Barcelona",
        "home_score": 2,
        "away_score": 2,
        "clock": "78'",
        "market": "Mais um gol na partida",
        "signal": "Real Madrid e Barcelona em ritmo intenso. Ambos buscam a virada.",
        "confidence": "ALTA",
        "triggered_at": _now.isoformat(),
        "is_active": True,
        "pressure": {
            "possession": "48%/52%",
            "shots": "11/9",
            "corners": "6/5",
            "pressure_score": "9.1/10",
            "green_condition": "Alta intensidade bilateral",
        },
    },
]

# ---------------------------------------------------------------------------
# Planos de assinatura mock
# ---------------------------------------------------------------------------

MOCK_SUBSCRIPTION_PLANS = [
    {
        "id": 1,
        "name": "Semanal",
        "description": "Acesso completo por 7 dias",
        "price_cents": 1990,
        "interval": "weekly",
        "is_active": True,
    },
    {
        "id": 2,
        "name": "Quinzenal",
        "description": "Acesso completo por 15 dias",
        "price_cents": 2990,
        "interval": "biweekly",
        "is_active": True,
    },
    {
        "id": 3,
        "name": "Mensal",
        "description": "Acesso completo por 30 dias",
        "price_cents": 4990,
        "interval": "monthly",
        "is_active": True,
    },
]
