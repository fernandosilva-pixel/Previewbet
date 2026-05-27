"use client";

import { useEffect, useState, useCallback } from "react";
import { TopNav } from "@/components/layout/TopNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { GameRow } from "@/components/games/GameRow";
import { LeagueBadge } from "@/components/ui/LeagueBadge";
import { fetchGames } from "@/lib/api";
import type { Game } from "@/lib/types";

function groupByLeague(games: Game[]) {
  const map = new Map<string, { league: string; leagueId: string; games: Game[] }>();
  for (const g of games) {
    const key = g.leagueId || g.league;
    if (!map.has(key)) map.set(key, { league: g.league, leagueId: key, games: [] });
    map.get(key)!.games.push(g);
  }
  return Array.from(map.values());
}

export default function AoVivoPage() {
  const [liveGames, setLiveGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = useCallback(async () => {
    try {
      const all = await fetchGames();
      setLiveGames(all.filter((g) => g.isLive));
      setLastUpdated(new Date());
    } catch {
      // mantém o último valor
    } finally {
      setLoading(false);
    }
  }, []);

  // Primeira carga + atualização automática a cada 30s
  useEffect(() => {
    load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, [load]);

  const groups = groupByLeague(liveGames);

  return (
    <div className="flex flex-col min-h-screen">
      <TopNav />

      <div className="flex flex-1 overflow-hidden" style={{ height: "calc(100vh - 56px)" }}>
        <Sidebar />

        <main className="flex-1 overflow-y-auto">
          {/* Header */}
          <div
            className="px-4 py-4 border-b border-border-subtle flex items-center justify-between"
            style={{ background: "rgba(255,255,255,0.02)" }}
          >
            <div className="flex items-center gap-3">
              <span
                className="w-2.5 h-2.5 rounded-full bg-live-red animate-pulse_live"
                style={{ boxShadow: "0 0 8px rgba(229,62,62,0.8)" }}
              />
              <h1 className="text-white font-bold text-lg">Jogos Ao Vivo</h1>
              {!loading && (
                <span
                  className="text-xs font-bold text-white px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(229,62,62,0.9)" }}
                >
                  {liveGames.length} {liveGames.length === 1 ? "jogo" : "jogos"}
                </span>
              )}
            </div>
            {lastUpdated && (
              <span className="text-[11px] text-text-muted">
                Atualizado {lastUpdated.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
            )}
          </div>

          {/* Conteúdo */}
          {loading ? (
            <div className="py-16 text-center text-text-secondary text-sm animate-pulse">
              Buscando jogos ao vivo...
            </div>
          ) : liveGames.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-4xl mb-3">📺</p>
              <p className="text-text-secondary text-sm font-medium">Nenhum jogo ao vivo no momento</p>
              <p className="text-text-muted text-xs mt-1">A página atualiza automaticamente a cada 30 segundos</p>
            </div>
          ) : (
            <div className="px-3 pt-3 space-y-3">
              {groups.map(({ league, leagueId, games }) => (
                <div
                  key={leagueId}
                  className="overflow-hidden rounded-2xl"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(229,62,62,0.2)",
                    boxShadow: "0 4px 16px rgba(229,62,62,0.08)",
                  }}
                >
                  <div
                    className="flex items-center gap-2 px-4 py-2.5 border-b border-border-subtle"
                    style={{ background: "rgba(229,62,62,0.05)" }}
                  >
                    <LeagueBadge league={league} />
                    <span className="ml-auto text-[11px] text-live-red font-semibold">
                      {games.length} ao vivo
                    </span>
                  </div>
                  {games.map((g) => (
                    <GameRow key={g.id} game={g} />
                  ))}
                </div>
              ))}
            </div>
          )}

          <div className="h-24 md:h-6" />
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
