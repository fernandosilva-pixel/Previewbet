import axios from "axios";
import type { Game, Analysis, Bingo, AccuracyStats, LiveAlert, SubscriptionPlan } from "./types";

/**
 * Usa o proxy server-side do Next.js (/api/backend/**).
 * O browser chama a mesma origem → sem CORS, sem NEXT_PUBLIC_API_URL.
 * O proxy lê BACKEND_URL em runtime (server-side) e repassa para o FastAPI.
 */
const api = axios.create({
  baseURL: "/api/backend",
  timeout: 12000,
});

// Injeta token JWT do Supabase nas requisições autenticadas
api.interceptors.request.use(async (config) => {
  if (typeof window !== "undefined") {
    const { getSession } = await import("./supabase");
    const session = await getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
  }
  return config;
});

// ---------------------------------------------------------------------------
// Games — retorna tudo de uma vez; filtro por data é feito no frontend
// ---------------------------------------------------------------------------

export async function fetchGames(): Promise<Game[]> {
  const { data } = await api.get<Game[]>("/api/games/");
  return data;
}

export async function fetchGame(id: string): Promise<Game> {
  const { data } = await api.get<Game>(`/api/games/${id}`);
  return data;
}

/** Mapa de logos locais como fallback: { "Flamengo": "/static/logos/flamengo.png", ... } */
export async function fetchLogoMap(): Promise<Record<string, string>> {
  const { data } = await api.get<Record<string, string>>("/api/games/logos/teams");
  return data;
}

// ---------------------------------------------------------------------------
// Analysis
// ---------------------------------------------------------------------------

export async function fetchAnalysis(gameId: string): Promise<Analysis> {
  const { data } = await api.get<Analysis>(`/api/analysis/${gameId}`);
  return data;
}

export async function fetchAnalysisSummary(): Promise<AccuracyStats> {
  const { data } = await api.get<AccuracyStats>("/api/analysis/summary");
  return data;
}

// ---------------------------------------------------------------------------
// Bingos
// ---------------------------------------------------------------------------

export async function fetchBingos(category?: string): Promise<Bingo[]> {
  const params = category ? { category } : undefined;
  const { data } = await api.get<Bingo[]>("/api/bingos", { params });
  return data;
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

export async function fetchAccuracy(): Promise<AccuracyStats[]> {
  const { data } = await api.get<AccuracyStats[]>("/api/stats/accuracy");
  return data;
}

export async function fetchAccuracyByLeague(league: string): Promise<AccuracyStats> {
  const { data } = await api.get<AccuracyStats>(`/api/stats/accuracy/league/${encodeURIComponent(league)}`);
  return data;
}

// ---------------------------------------------------------------------------
// Live
// ---------------------------------------------------------------------------

export async function fetchActiveAlerts(): Promise<LiveAlert[]> {
  const { data } = await api.get<LiveAlert[]>("/api/alerts/active");
  return data;
}

// ---------------------------------------------------------------------------
// Subscription
// ---------------------------------------------------------------------------

export async function fetchPlans(): Promise<SubscriptionPlan[]> {
  const { data } = await api.get<SubscriptionPlan[]>("/api/subscription/plans");
  return data;
}

export async function fetchSubscriptionStatus(): Promise<{
  has_subscription: boolean;
  plan_name?: string;
  expires_at?: string;
  permissions: Record<string, boolean>;
}> {
  const { data } = await api.get("/api/subscription/status");
  return data;
}

export default api;
