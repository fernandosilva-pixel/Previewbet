/**
 * GET /api/games
 * Retorna jogos do Supabase imediatamente (< 1s).
 * Dispara sync da ESPN em background se os dados tiverem > 30min.
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

function dateStr(offsetDays = 0) {
  const d = new Date(Date.now() + offsetDays * 86_400_000);
  return d.toISOString().split("T")[0].replace(/-/g, ""); // "20260527"
}

export async function GET() {
  const supabase = getSupabase();

  // --- sem Supabase: busca ESPN direto só para hoje ---
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

  // --- lê do Supabase imediatamente ---
  let games: ReturnType<typeof rowToGame>[] = [];
  try {
    const { data } = await supabase
      .from("games")
      .select("*")
      .order("datetime", { ascending: true })
      .limit(500);

    games = (data ?? []).map(rowToGame).sort((a, b) =>
      (a.isLive ? 0 : 1) - (b.isLive ? 0 : 1) || a.datetime.localeCompare(b.datetime)
    );
  } catch (err) {
    console.error("[games] erro ao ler Supabase:", err);
  }

  // --- dispara sync em background se necessário (não bloqueia a resposta) ---
  checkAndSync(supabase).catch(() => {});

  return NextResponse.json(games);
}

/** Verifica staleness e sincroniza em background — não bloqueia a resposta HTTP */
async function checkAndSync(supabase: AnySupabase) {
  try {
    const today = new Date().toISOString().split("T")[0];
    const { data: existing } = await supabase
      .from("games")
      .select("updated_at")
      .gte("datetime", today)
      .order("updated_at", { ascending: false })
      .limit(1);

    const lastUpdate = existing?.[0]?.updated_at
      ? new Date(existing[0].updated_at).getTime()
      : 0;

    // Só sincroniza se tiver > 30 minutos sem update
    if (Date.now() - lastUpdate < 30 * 60 * 1000) return;

    console.log("[games] sync background iniciado...");
    for (const offset of [0, 1, 2]) {
      const date = dateStr(offset);
      const rows = await fetchAllLeagues(date);
      if (rows.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await supabase.from("games").upsert(rows as any[], { onConflict: "external_id" });
        console.log(`[games] sync ${date}: ${rows.length} jogos`);
      }
    }
  } catch (err) {
    console.error("[games] sync background erro:", err);
  }
}
