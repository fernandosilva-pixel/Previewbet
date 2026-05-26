// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export type GameStatus = "scheduled" | "live" | "finished" | "postponed";
export type Confidence = "ALTA" | "MEDIA" | "BAIXA";
export type Result = "Casa" | "Fora" | "Empate" | "CasaEmpate" | "ForaEmpate";

// ---------------------------------------------------------------------------
// Game
// ---------------------------------------------------------------------------

export interface Game {
  id: number;
  external_id: string;
  league: string;
  country: string;
  home_team: string;
  away_team: string;
  home_logo: string;
  away_logo: string;
  datetime: string;
  status: GameStatus;
  home_score: number | null;
  away_score: number | null;
  clock: string | null;
  period: number | null;
  home_possession: number | null;
  away_possession: number | null;
  home_shots: number | null;
  away_shots: number | null;
  home_corners: number | null;
  away_corners: number | null;
  home_yellow_cards: number | null;
  away_yellow_cards: number | null;
  has_odds: boolean;
  odds_home: number | null;
  odds_draw: number | null;
  odds_away: number | null;
}

// ---------------------------------------------------------------------------
// Analysis
// ---------------------------------------------------------------------------

export interface Analysis {
  id: number;
  game_id: number;
  resultado: {
    r: Result;
    c: Confidence;
    just: string;    // justificativa
    ins: string;     // insight
    fc: string;      // forma casa
    ff: string;      // forma fora
    fca: number;     // força casa /10
    ffo: number;     // força fora /10
    fav: string;     // favorito
  };
  gols: {
    mk: string;              // mercado (ex: "Mais de 2.5")
    cf: Confidence;
    te: string;              // total esperado
    am: "Sim" | "Não";      // ambas marcam
    nt: string;              // nota de análise
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
    mg: number;                              // minuto de geração
    st: "Aberto" | "Fechado";
    pls: Array<{ p: string; v: string }>;   // placar / probabilidade
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
  sub_picks: Array<{
    market_label: string;
    odd: number;
  }>;
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
  game_id: number;
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
