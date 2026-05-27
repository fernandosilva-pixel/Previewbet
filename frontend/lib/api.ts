import axios from "axios";
import type { Game, Analysis, Bingo, AccuracyStats, LiveAlert, SubscriptionPlan } from "./types";

// Rotas nativas do Next.js — mesma origem, sem CORS, sem backend separado
const api = axios.create({
  baseURL: "/api",
  timeout: 20000,
});

// Injeta token JWT nas requisições autenticadas
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

export async function fetchGames(): Promise<Game[]> {
  const { data } = await api.get<Game[]>("/games");
  return data;
}

export async function fetchGame(id: string): Promise<Game> {
  const { data } = await api.get<Game>(`/games/${id}`);
  return data;
}

export async function fetchLogoMap(): Promise<Record<string, string>> {
  return {}; // logos vêm direto da ESPN agora
}

// ---------------------------------------------------------------------------
// Analysis (stub — será implementado com Claude AI)
// ---------------------------------------------------------------------------

export async function fetchAnalysis(_gameId: string): Promise<Analysis> {
  throw new Error("não implementado");
}

export async function fetchAnalysisSummary(): Promise<AccuracyStats> {
  const empty = { total: 0, correct: 0, pct: 0 };
  return { league: "Geral", total: 0, correct: 0, accuracy_pct: 0, by_confidence: { ALTA: empty, MEDIA: empty, BAIXA: empty } };
}

// ---------------------------------------------------------------------------
// Bingos
// ---------------------------------------------------------------------------

export async function fetchBingos(_category?: string): Promise<Bingo[]> {
  return [];
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

export async function fetchAccuracy(): Promise<AccuracyStats[]> {
  return [];
}

export async function fetchAccuracyByLeague(_league: string): Promise<AccuracyStats> {
  throw new Error("não implementado");
}

// ---------------------------------------------------------------------------
// Live
// ---------------------------------------------------------------------------

export async function fetchActiveAlerts(): Promise<LiveAlert[]> {
  return [];
}

// ---------------------------------------------------------------------------
// Subscription
// ---------------------------------------------------------------------------

export async function fetchPlans(): Promise<SubscriptionPlan[]> {
  return [];
}

export async function fetchSubscriptionStatus() {
  return { has_subscription: false, permissions: {} };
}

export default api;
