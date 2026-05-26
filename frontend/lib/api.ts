import axios from "axios";
import type { Game, Analysis, Bingo, AccuracyStats, LiveAlert, SubscriptionPlan } from "./types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
  timeout: 10000,
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
// Games
// ---------------------------------------------------------------------------

export async function fetchGames(
  date: "hoje" | "amanha" | "encerrados" = "hoje",
  league?: string
): Promise<Game[]> {
  const params: Record<string, string> = { date };
  if (league) params.league = league;
  const { data } = await api.get<Game[]>("/api/games", { params });
  return data;
}

export async function fetchGame(id: number): Promise<Game> {
  const { data } = await api.get<Game>(`/api/games/${id}`);
  return data;
}

// ---------------------------------------------------------------------------
// Analysis
// ---------------------------------------------------------------------------

export async function fetchAnalysis(gameId: number): Promise<Analysis> {
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
