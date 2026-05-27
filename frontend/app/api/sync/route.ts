/**
 * POST /api/sync — força sincronização manual com a ESPN.
 * Útil para o admin ou para testar.
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { fetchAllLeagues } from "@/lib/espn";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

function dateStr(offsetDays = 0) {
  const d = new Date(Date.now() + offsetDays * 86_400_000);
  return d.toISOString().split("T")[0].replace(/-/g, "");
}

export async function POST() {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase não configurado" }, { status: 503 });
  }

  const dates = [dateStr(0), dateStr(1), dateStr(2)];
  let total = 0;

  for (const date of dates) {
    try {
      const rows = await fetchAllLeagues(date);
      if (rows.length > 0) {
        await supabase.from("games").upsert(rows, { onConflict: "external_id" });
        total += rows.length;
        console.log(`[sync] ${date}: ${rows.length} jogos`);
      }
    } catch (err) {
      console.error(`[sync] ${date} erro:`, err);
    }
  }

  return NextResponse.json({ ok: true, total });
}
