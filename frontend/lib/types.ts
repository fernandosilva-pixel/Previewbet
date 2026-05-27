// ---------------------------------------------------------------------------
// Game (ESPN real data)
// ---------------------------------------------------------------------------

export type GameStatus =
  | "STATUS_SCHEDULED"
  | "STATUS_IN_PROGRESS"
  | "STATUS_FINAL"
  | "STATUS_POSTPONED";

export interface Game {
  id: string;            // ex: "e_401865466"
  espn_id: string;
  home: string;
  away: string;
  homeLogo: string;
  awayLogo: string;
  datetime: string;      // ISO 8601 UTC: "2026-05-27T22:00:00+00:00"
  league: string;
  leagueShort: string;
  leagueId: string;
  status: GameStatus;
  isLive: boolean;
  isFinal: boolean;
  homeScore: number;
  awayScore: number;
  clock: string;         // ex: "67'" ou "0'"
  period: number;
}

// ---------------------------------------------------------------------------
// Analysis
// ---------------------------------------------------------------------------

export type Confidence = "ALTA" | "MEDIA" | "BAIXA";
export type Result = "Casa" | "Fora" | "Empate" | "CasaEmpate" | "ForaEmpate";

export interface Analysis {
  id: number;
  game_id: string;
  resultado: {
    r: Result;
    c: Confidence;
    just: string;
    ins: string;
    fc: string;
    ff: string;
    fca: number;
    ffo: number;
    fav: string;
  };
  gols: {
    mk: string;
    cf: Confidence;
    te: string;
    am: "Sim" | "Não";
    nt: string;
  };
  escanteios: {
    mk: string;
    cf: Confidence;
    te: string;
  };
  cartoes: {
    mk: string;
    cf: Confidence;
    te: string;
  };
  placar: {
    mg: number;
    st: "Aberto" | "Fechado";
    pls: Array<{ p: string; v: string }>;
  };
  combinacoes: {
    conservador: string;
    moderado: string;
    ousado: string;
  };
  created_at: string;
}

// ---------------------------------------------------------------------------
// Bingo
// ---------------------------------------------------------------------------

export interface BingoSelection {
  home: string;
  away: string;
  league: string;
  datetime: string;
  market_label: string;
  odd: number;
  confidence: Confidence;
  sub_picks: Array<{ market_label: string; odd: number }>;
}

export interface Bingo {
  id: number;
  name: string;
  category: "conservador" | "moderado" | "maximo";
  tier: "seguro" | "moderado" | "risco";
  total_odd: number;
  confidence_pct: number;
  selections: BingoSelection[];
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

export interface ConfidenceStats {
  total: number;
  correct: number;
  pct: number;
}

export interface AccuracyStats {
  league: string;
  total: number;
  correct: number;
  accuracy_pct: number;
  by_confidence: {
    ALTA: ConfidenceStats;
    MEDIA: ConfidenceStats;
    BAIXA: ConfidenceStats;
  };
}

// ---------------------------------------------------------------------------
// User / Auth
// ---------------------------------------------------------------------------

export interface User {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
  is_active: boolean;
  has_subscription: boolean;
  subscription_expires_at: string | null;
  permissions: {
    jogos: boolean;
    aovivo: boolean;
    bingos: boolean;
    segmentos: boolean;
  };
}

// ---------------------------------------------------------------------------
// Subscription
// ---------------------------------------------------------------------------

export interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  price_cents: number;
  interval: "weekly" | "biweekly" | "monthly";
}

// ---------------------------------------------------------------------------
// Live
// ---------------------------------------------------------------------------

export interface LiveAlert {
  id: number;
  game_id: string;
  league: string;
  home: string;
  away: string;
  home_score: number;
  away_score: number;
  clock: string;
  market: string;
  signal: string;
  confidence: Confidence;
  triggered_at: string;
  pressure: {
    possession: string;
    shots: string;
    corners: string;
    pressure_score: string;
    green_condition: string;
  };
}

// ---------------------------------------------------------------------------
// API response wrappers
// ---------------------------------------------------------------------------

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
}

export interface ApiError {
  detail: string;
  status_code: number;
}
