/**
 * ESPN unofficial API — busca jogos de futebol sem chave.
 * URL: https://site.api.espn.com/apis/site/v2/sports/soccer/{league}/scoreboard?dates=YYYYMMDD
 */

export interface LeagueDef {
  id: string;
  name: string;
  short: string;
  country: string;
}

export const LEAGUES: LeagueDef[] = [
  // BRASIL
  { id: "bra.1",                     name: "Brasileirão Série A",          short: "SÉRIE A",   country: "Brasil" },
  { id: "bra.2",                     name: "Brasileirão Série B",          short: "SÉRIE B",   country: "Brasil" },
  { id: "conmebol.libertadores",     name: "Libertadores",                 short: "LIBERTAD.", country: "CONMEBOL" },
  { id: "conmebol.sudamericana",     name: "Sul-Americana",                short: "SULAMER.",  country: "CONMEBOL" },
  { id: "conmebol.recopa",           name: "Recopa Sudamericana",          short: "RECOPA",    country: "CONMEBOL" },
  { id: "conmebol.world_qualifying", name: "Elim. Copa do Mundo CONMEBOL", short: "ELIM CM",   country: "CONMEBOL" },
  // INGLATERRA
  { id: "eng.1",          name: "Premier League",  short: "PREMIER",   country: "Inglaterra" },
  { id: "eng.2",          name: "Championship",    short: "CHAMPIO.",  country: "Inglaterra" },
  { id: "eng.3",          name: "League One",      short: "LG ONE",    country: "Inglaterra" },
  { id: "eng.4",          name: "League Two",      short: "LG TWO",    country: "Inglaterra" },
  { id: "eng.fa",         name: "FA Cup",          short: "FA CUP",    country: "Inglaterra" },
  { id: "eng.league_cup", name: "EFL Cup",         short: "EFL CUP",   country: "Inglaterra" },
  // ESPANHA
  { id: "esp.1",            name: "La Liga",             short: "LA LIGA",  country: "Espanha" },
  { id: "esp.2",            name: "La Liga 2",           short: "LIGA 2",   country: "Espanha" },
  { id: "esp.copa_del_rey", name: "Copa del Rey",        short: "COPA REY", country: "Espanha" },
  // ITÁLIA
  { id: "ita.1",            name: "Serie A",             short: "SERIE A",  country: "Itália" },
  { id: "ita.2",            name: "Serie B",             short: "SERIE B",  country: "Itália" },
  { id: "ita.coppa_italia", name: "Coppa Italia",        short: "COPPA IT", country: "Itália" },
  // ALEMANHA
  { id: "ger.1",        name: "Bundesliga",    short: "BUNDESL.", country: "Alemanha" },
  { id: "ger.2",        name: "2. Bundesliga", short: "BUND. 2",  country: "Alemanha" },
  { id: "ger.dfb_pokal",name: "DFB Pokal",    short: "DFB POK.", country: "Alemanha" },
  // FRANÇA
  { id: "fra.1",               name: "Ligue 1",          short: "LIGUE 1", country: "França" },
  { id: "fra.2",               name: "Ligue 2",          short: "LIGUE 2", country: "França" },
  { id: "fra.coupe_de_france", name: "Coupe de France",  short: "CDL FRA", country: "França" },
  // PORTUGAL
  { id: "por.1", name: "Primeira Liga",   short: "1ª LIGA", country: "Portugal" },
  // HOLANDA
  { id: "ned.1", name: "Eredivisie", short: "EREDIV.", country: "Holanda" },
  // BÉLGICA
  { id: "bel.1", name: "Pro League", short: "PRO LG", country: "Bélgica" },
  // TURQUIA
  { id: "tur.1", name: "Süper Lig", short: "SÜPER", country: "Turquia" },
  // OUTROS EUROPEUS
  { id: "rus.1", name: "Premier League (Rússia)", short: "RPL",      country: "Rússia" },
  { id: "gre.1", name: "Super League (Grécia)",   short: "SUPER LG", country: "Grécia" },
  { id: "aut.1", name: "Bundesliga (Áustria)",    short: "AUT. BL",  country: "Áustria" },
  { id: "cze.1", name: "Fortuna Liga",            short: "FORTUNA",  country: "Rep. Checa" },
  { id: "den.1", name: "Superligaen",             short: "SUPERLIG", country: "Dinamarca" },
  { id: "swe.1", name: "Allsvenskan",             short: "ALLSV.",   country: "Suécia" },
  { id: "nor.1", name: "Eliteserien",             short: "ELITES.",  country: "Noruega" },
  { id: "sui.1", name: "Super League (Suíça)",    short: "SUI SL",   country: "Suíça" },
  { id: "sco.1", name: "Scottish Premiership",    short: "SCO PREM", country: "Escócia" },
  { id: "pol.1", name: "Ekstraklasa",             short: "EKSTRA.",  country: "Polônia" },
  // AMÉRICAS
  { id: "arg.1",              name: "Liga Profesional (Argentina)", short: "LIG. ARG", country: "Argentina" },
  { id: "chi.1",              name: "Primera División (Chile)",     short: "CHI 1",    country: "Chile" },
  { id: "col.1",              name: "Primera A",                    short: "COL 1A",   country: "Colômbia" },
  { id: "ecu.1",              name: "LigaPro",                      short: "LIGAPRO",  country: "Equador" },
  { id: "par.1",              name: "Primera División (Paraguai)",  short: "PAR 1",    country: "Paraguai" },
  { id: "uru.1",              name: "Liga AUF",                     short: "URU 1",    country: "Uruguai" },
  { id: "per.1",              name: "Liga 1",                       short: "LIG. 1",   country: "Peru" },
  { id: "mex.1",              name: "Liga BBVA MX",                 short: "LIGA MX",  country: "México" },
  { id: "concacaf.champions", name: "Champions Cup CONCACAF",       short: "CONCAF.",  country: "CONCACAF" },
  { id: "usa.1",              name: "MLS",                          short: "MLS",      country: "EUA" },
  // ORIENTE MÉDIO / ÁFRICA
  { id: "sau.1",     name: "Saudi Pro League",        short: "SAUDI",   country: "Arábia Saudita" },
  { id: "egy.1",     name: "Premier League (Egito)",  short: "EGY PL",  country: "Egito" },
  { id: "isr.1",     name: "Premier League (Israel)", short: "ISR PL",  country: "Israel" },
  { id: "caf.nations",  name: "Copa Africana de Nações", short: "AFCON",  country: "CAF" },
  // ÁSIA
  { id: "jpn.1", name: "J-League", short: "J1 LG", country: "Japão" },
  { id: "kor.1", name: "K-League", short: "K1 LG", country: "Coreia do Sul" },
  { id: "chn.1", name: "Super League (China)", short: "CSL", country: "China" },
  { id: "aus.1", name: "A-League Men", short: "A-LG", country: "Austrália" },
  // UEFA / FIFA
  { id: "uefa.champions",         name: "Champions League",        short: "UCL",      country: "UEFA" },
  { id: "uefa.europa",            name: "Europa League",           short: "UEL",      country: "UEFA" },
  { id: "uefa.europa.conference", name: "Conference League",       short: "UECL",     country: "UEFA" },
  { id: "uefa.nations",           name: "UEFA Nations League",     short: "UNL",      country: "UEFA" },
  { id: "uefa.euro",              name: "Eurocopa",                short: "EURO",     country: "UEFA" },
  { id: "fifa.cwc",               name: "Mundial de Clubes",       short: "CLUB WC",  country: "FIFA" },
  { id: "fifa.world",             name: "Copa do Mundo",           short: "COPA MU",  country: "FIFA" },
  { id: "conmebol.america",       name: "Copa América",            short: "COPA AM",  country: "CONMEBOL" },
  { id: "fifa.friendly",          name: "Amistosos Internacionais",short: "AMISTOSO", country: "FIFA" },
  { id: "concacaf.gold",          name: "Gold Cup",                short: "GOLD CUP", country: "CONCACAF" },
];

export const LEAGUE_SHORT: Record<string, string> = Object.fromEntries(
  LEAGUES.map((l) => [l.id, l.short])
);

const STATUS_MAP: Record<string, string> = {
  // Agendado
  STATUS_SCHEDULED:     "scheduled",
  STATUS_DELAYED:       "scheduled",
  STATUS_RAIN_DELAY:    "scheduled",
  // Em andamento — ESPN usa vários nomes granulares
  STATUS_IN_PROGRESS:   "in_progress",
  STATUS_FIRST_HALF:    "in_progress",
  STATUS_SECOND_HALF:   "in_progress",
  STATUS_HALFTIME:      "in_progress",
  STATUS_EXTRA_TIME:    "in_progress",
  STATUS_ET_HALFTIME:   "in_progress",
  STATUS_PENALTIES:     "in_progress",
  STATUS_OVERTIME:      "in_progress",
  // Encerrado
  STATUS_FINAL:         "final",
  STATUS_FULL_TIME:     "final",
  STATUS_FULL_PEN:      "final",
  STATUS_ABANDONED:     "final",
  // Outros
  STATUS_POSTPONED:     "postponed",
  STATUS_CANCELLED:     "cancelled",
  STATUS_SUSPENDED:     "suspended",
};

const DB_TO_ESPN: Record<string, string> = {
  scheduled:   "STATUS_SCHEDULED",
  in_progress: "STATUS_IN_PROGRESS",
  final:       "STATUS_FINAL",
  postponed:   "STATUS_POSTPONED",
  cancelled:   "STATUS_CANCELLED",
  suspended:   "STATUS_SUSPENDED",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseEvent(event: any, league: LeagueDef): Record<string, unknown> | null {
  try {
    const comp = event.competitions?.[0];
    const competitors = comp?.competitors ?? [];
    const home = competitors.find((c: any) => c.homeAway === "home");
    const away = competitors.find((c: any) => c.homeAway === "away");
    if (!home || !away) return null;

    const statusInfo = comp?.status ?? {};
    const espnStatus: string = statusInfo?.type?.name ?? "STATUS_SCHEDULED";
    const dbStatus = STATUS_MAP[espnStatus] ?? "scheduled";
    const isScheduled = dbStatus === "scheduled";

    return {
      external_id: `espn_${event.id}`,
      league:      league.name,
      country:     league.country,
      source:      league.id,
      home_team:   home.team?.displayName ?? "",
      away_team:   away.team?.displayName ?? "",
      home_logo:   home.team?.logo ?? "",
      away_logo:   away.team?.logo ?? "",
      datetime:    event.date,
      status:      dbStatus,
      home_score:  isScheduled ? null : Number(home.score ?? 0),
      away_score:  isScheduled ? null : Number(away.score ?? 0),
      clock:       statusInfo.displayClock ?? "",
      period:      statusInfo.period ?? 0,
      updated_at:  new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

/** Busca todos os jogos de uma data para todas as ligas (em paralelo, batches de 8). */
export async function fetchAllLeagues(date: string): Promise<Record<string, unknown>[]> {
  const BATCH = 8;
  const rows: Record<string, unknown>[] = [];

  for (let i = 0; i < LEAGUES.length; i += BATCH) {
    const batch = LEAGUES.slice(i, i + BATCH);
    const results = await Promise.allSettled(
      batch.map(async (league) => {
        const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/${league.id}/scoreboard?dates=${date}&limit=200`;
        try {
          const res = await fetch(url, { cache: "no-store" });
          if (!res.ok) return [];
          const json = await res.json();
          return (json.events ?? [])
            .map((e: unknown) => parseEvent(e, league))
            .filter(Boolean) as Record<string, unknown>[];
        } catch {
          return [];
        }
      })
    );
    for (const r of results) {
      if (r.status === "fulfilled") rows.push(...r.value);
    }
  }

  return rows;
}

/** Converte uma linha do Supabase no formato que o frontend espera. */
export function rowToGame(row: Record<string, unknown>) {
  const dbStatus = (row.status as string) ?? "scheduled";
  const espnStatus = DB_TO_ESPN[dbStatus] ?? "STATUS_SCHEDULED";
  const leagueId = (row.source as string) ?? "";

  return {
    id:          String(row.id),
    espn_id:     (row.external_id as string) ?? "",
    home:        (row.home_team as string) ?? "",
    away:        (row.away_team as string) ?? "",
    homeLogo:    (row.home_logo as string) ?? "",
    awayLogo:    (row.away_logo as string) ?? "",
    datetime:    (row.datetime as string) ?? "",
    league:      (row.league as string) ?? "",
    leagueShort: LEAGUE_SHORT[leagueId] ?? ((row.league as string) ?? "").slice(0, 8).toUpperCase(),
    leagueId,
    status:      espnStatus,
    isLive:      dbStatus === "in_progress",
    isFinal:     dbStatus === "final",
    homeScore:   (row.home_score as number) ?? 0,
    awayScore:   (row.away_score as number) ?? 0,
    clock:       (row.clock as string) ?? "",
    period:      (row.period as number) ?? 0,
  };
}
