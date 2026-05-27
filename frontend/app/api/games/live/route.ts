/**
 * GET /api/games/live
 * Busca dados FRESCOS da ESPN para hoje e retorna só os jogos ao vivo.
 * Chamado pela página Ao Vivo a cada 30s.
 */

import { NextResponse } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { fetchAllLeagues, rowToGame } from "@/lib/espn";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = SupabaseClient<any, any, any>;

function getSupabase(): AnySupabase | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key) as AnySupabase;
}

function todayStr() {
  return new Date().toISOString().split("T")[0].replace(/-/g, ""); // "20260527"
}

export async function GET() {
  try {
    // Busca dados frescos da ESPN (só hoje — rápido ~3-5s)
    const rows = await fetchAllLeagues(todayStr());

    // Atualiza Supabase em background
    const supabase = getSupabase();
    if (supabase && rows.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      void supabase.from("games").upsert(rows as any[], { onConflict: "external_id" });
    }

    // Retorna só os jogos ao vivo
    const liveGames = rows
      .map(rowToGame)
      .filter((g) => g.isLive)
      .sort((a, b) => a.datetime.localeCompare(b.datetime));

    return NextResponse.json(liveGames);
  } catch (err) {
    console.error("[live] erro:", err);
    return NextResponse.json([]);
  }
}
