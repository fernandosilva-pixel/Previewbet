"use client";

import { useEffect, useState } from "react";
import { GameRow } from "./GameRow";
import { LeagueBadge } from "@/components/ui/LeagueBadge";
import { SkeletonGameList } from "@/components/ui/SkeletonGameRow";
import { fetchGames, fetchAnalysis } from "@/lib/api";
import type { Game, Analysis } from "@/lib/types";

type DateFilter = "hoje" | "amanha" | "encerrados";

interface LeagueGroup {
  league: string;
  games: Game[];
}

function groupByLeague(games: Game[]): LeagueGroup[] {
  const map = new Map<string, Game[]>();
  for (const g of games) {
    if (!map.has(g.league)) map.set(g.league, []);
    map.get(g.league)!.push(g);
  }
  return Array.from(map.entries()).map(([league, games]) => ({ league, games }));
}

export function GameList() {
  const [games, setGames] = useState<Game[]>([]);
  const [analyses, setAnalyses] = useState<Record<number, Analysis>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<DateFilter>("hoje");

  useEffect(() => {
    setLoading(true);
    fetchGames(filter)
      .then(async (data) => {
        setGames(data);
        const analysisMap: Record<number, Analysis> = {};
        await Promise.all(
          data.slice(0, 6).map(async (g) => {
            try {
              const a = await fetchAnalysis(g.id);
              if (a) analysisMap[g.id] = a;
            } catch {}
          })
        );
        setAnalyses(analysisMap);
      })
      .catch(() => setGames([]))
      .finally(() => setLoading(false));
  }, [filter]);

  const groups = groupByLeague(games);

  return (
    <div>
      {/* Filtros de data */}
      <div className="flex gap-1 px-4 py-3 border-b border-border-subtle">
        {(["hoje", "amanha", "encerrados"] as DateFilter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              filter === f
                ? "bg-brand-primary text-white"
                : "text-text-secondary hover:text-white hover:bg-bg-card"
            }`}
          >
            {f === "hoje" ? "Hoje" : f === "amanha" ? "Amanhã" : "Encerrados"}
          </button>
        ))}
      </div>

      {loading ? (
        <>
          <SkeletonGameList />
          <SkeletonGameList />
        </>
      ) : groups.length === 0 ? (
        <div className="py-12 text-center text-text-muted text-sm">
          Nenhum jogo encontrado.
        </div>
      ) : (
        groups.map(({ league, games }) => (
          <div key={league} className="bg-bg-card rounded-lg overflow-hidden mb-3 mx-3 mt-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-bg-card border-b border-border-subtle">
              <LeagueBadge league={league} />
              <span className="ml-auto text-[11px] text-text-muted">
                {games.length} {games.length === 1 ? "jogo" : "jogos"}
              </span>
            </div>
            {games.map((g) => (
              <GameRow key={g.id} game={g} analysis={analyses[g.id]} />
            ))}
          </div>
        ))
      )}

      {/* Espaço para nav mobile */}
      <div className="h-20 md:h-4" />
    </div>
  );
}
