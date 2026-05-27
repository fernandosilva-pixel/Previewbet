"use client";

import { useEffect, useState, useMemo } from "react";
import { GameRow } from "./GameRow";
import { LeagueBadge } from "@/components/ui/LeagueBadge";
import { SkeletonGameList } from "@/components/ui/SkeletonGameRow";
import { fetchGames, fetchLogoMap, fetchAnalysis } from "@/lib/api";
import { isGameToday, isGameTomorrow, isFinished } from "@/lib/utils";
import type { Game, Analysis } from "@/lib/types";

type DateFilter = "hoje" | "amanha" | "encerrados";

interface LeagueGroup {
  league: string;
  leagueId: string;
  games: Game[];
}

function groupByLeague(games: Game[]): LeagueGroup[] {
  const map = new Map<string, LeagueGroup>();
  for (const g of games) {
    const key = g.leagueId || g.league;
    if (!map.has(key)) map.set(key, { league: g.league, leagueId: key, games: [] });
    map.get(key)!.games.push(g);
  }
  return Array.from(map.values());
}

const FILTER_LABELS: Record<DateFilter, string> = {
  hoje: "Hoje",
  amanha: "Amanhã",
  encerrados: "Encerrados",
};

export function GameList() {
  const [allGames, setAllGames] = useState<Game[]>([]);
  const [logoMap, setLogoMap] = useState<Record<string, string>>({});
  const [analyses, setAnalyses] = useState<Record<string, Analysis>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<DateFilter>("hoje");

  // Busca todos os jogos UMA vez ao montar
  useEffect(() => {
    setLoading(true);
    Promise.all([fetchGames(), fetchLogoMap().catch(() => ({}))])
      .then(async ([games, logos]) => {
        setAllGames(games);
        setLogoMap(logos);

        // Busca análise para os primeiros 6 jogos de hoje
        const todayGames = games.filter((g) => isGameToday(g.datetime)).slice(0, 6);
        const analysisMap: Record<string, Analysis> = {};
        await Promise.allSettled(
          todayGames.map(async (g) => {
            try {
              const a = await fetchAnalysis(g.id);
              if (a) analysisMap[g.id] = a;
            } catch {}
          })
        );
        setAnalyses(analysisMap);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Filtra no frontend sem nova requisição
  const filtered = useMemo(() => {
    if (filter === "hoje") return allGames.filter((g) => isGameToday(g.datetime));
    if (filter === "amanha") return allGames.filter((g) => isGameTomorrow(g.datetime));
    return allGames.filter((g) => isFinished(g.status));
  }, [allGames, filter]);

  // Ao vivo sempre no topo
  const sorted = useMemo(
    () => [...filtered].sort((a, b) => {
      if (a.isLive && !b.isLive) return -1;
      if (!a.isLive && b.isLive) return 1;
      return new Date(a.datetime).getTime() - new Date(b.datetime).getTime();
    }),
    [filtered]
  );

  const groups = useMemo(() => groupByLeague(sorted), [sorted]);

  return (
    <div>
      {/* Filtro de dia */}
      <div className="flex gap-1 px-4 py-3 border-b border-border-subtle">
        {(Object.keys(FILTER_LABELS) as DateFilter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
              filter === f
                ? "nav-item-emboss-brand text-white"
                : "text-text-secondary hover:text-white hover:bg-bg-card"
            }`}
          >
            {FILTER_LABELS[f]}
          </button>
        ))}

        {/* Contador */}
        <span className="ml-auto text-[11px] text-text-muted self-center">
          {loading ? "..." : `${filtered.length} jogos`}
        </span>
      </div>

      {loading ? (
        <>
          <SkeletonGameList />
          <SkeletonGameList />
        </>
      ) : groups.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-4xl mb-3">⚽</p>
          <p className="text-text-secondary text-sm">Nenhum jogo encontrado para {FILTER_LABELS[filter].toLowerCase()}.</p>
        </div>
      ) : (
        <div className="px-3 pt-3 space-y-3">
          {groups.map(({ league, leagueId, games }) => (
            <div
              key={leagueId}
              className="overflow-hidden rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
              }}
            >
              {/* Header da liga */}
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border-subtle"
                style={{ background: "rgba(255,255,255,0.03)" }}>
                <LeagueBadge league={league} />
                <span className="ml-auto text-[11px] text-text-muted">
                  {games.length} {games.length === 1 ? "jogo" : "jogos"}
                </span>
              </div>

              {/* Jogos */}
              {games.map((g) => (
                <GameRow
                  key={g.id}
                  game={g}
                  analysis={analyses[g.id]}
                  logoMap={logoMap}
                />
              ))}
            </div>
          ))}
        </div>
      )}

      <div className="h-24 md:h-6" />
    </div>
  );
}
