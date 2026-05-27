/**
 * GET /api/games
 * Retorna jogos do Supabase. Se estiver vazio ou desatualizado, sincroniza primeiro.
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

function todayUTC() {
  return new Date().toISOString().split("T")[0]; // "2026-05-27"
}

function dateStr(offsetDays = 0) {
  const d = new Date(Date.now() + offsetDays * 86_400_000);
  return d.toISOString().split("T")[0].replace(/-/g, ""); // "20260527"
}

export async function GET() {
  const supabase = getSupabase();

  // --- sem Supabase → ESPN direto (sem cache) ---
  if (!supabase) {
    try {
      const rows = await fetchAllLeagues(dateStr(0));
      const games = rows.map(rowToGame).sort((a, b) =>
        (a.isLive ? 0 : 1) - (b.isLive ? 0 : 1) || a.datetime.localeCompare(b.datetime)
      );
      return NextResponse.json(games);
    } catch {
      return NextResponse.json([]);
    }
  }

  // --- verifica se o Supabase tem dados de hoje ---
  try {
    const today = todayUTC();
    const { data: existing, error } = await supabase
      .from("games")
      .select("updated_at")
      .gte("datetime", today)
      .order("updated_at", { ascending: false })
      .limit(1);

    if (error) throw error;

    const lastUpdate = existing?.[0]?.updated_at
      ? new Date(existing[0].updated_at).getTime()
      : 0;
    const stale = Date.now() - lastUpdate > 15 * 60 * 1000;

    if (stale) {
      console.log("[games] dados desatualizados — sincronizando ESPN...");
      await syncDays(supabase, [dateStr(0), dateStr(1), dateStr(2)]);
    }
  } catch (err) {
    console.error("[games] erro ao verificar/sincronizar:", err);
  }

  // --- lê do Supabase ---
  try {
    const { data, error } = await supabase
      .from("games")
      .select("*")
      .order("datetime", { ascending: true })
      .limit(500);

    if (error) throw error;

    const games = (data ?? []).map(rowToGame).sort((a, b) =>
      (a.isLive ? 0 : 1) - (b.isLive ? 0 : 1) || a.datetime.localeCompare(b.datetime)
    );
    return NextResponse.json(games);
  } catch (err) {
    console.error("[games] erro ao ler Supabase:", err);
    return NextResponse.json([]);
  }
}

async function syncDays(supabase: AnySupabase, dates: string[]) {
  for (const date of dates) {
    try {
      const rows = await fetchAllLeagues(date);
      if (rows.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await supabase.from("games").upsert(rows as any[], { onConflict: "external_id" });
        console.log(`[sync] ${date}: ${rows.length} jogos`);
      }
    } catch (err) {
      console.error(`[sync] ${date} erro:`, err);
    }
  }
}
