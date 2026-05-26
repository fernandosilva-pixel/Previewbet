"use client";

import { useEffect, useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import Link from "next/link";
import { ConfidenceBadge } from "@/components/ui/ConfidenceBadge";
import { LiveIndicator } from "@/components/ui/LiveIndicator";
import { LeagueBadge } from "@/components/ui/LeagueBadge";
import { fetchGames, fetchAnalysis } from "@/lib/api";
import { formatOdd, isLive } from "@/lib/utils";
import type { Game, Analysis } from "@/lib/types";

interface FeaturedGame {
  game: Game;
  analysis: Analysis | null;
}

const RESULT_LABEL: Record<string, string> = {
  Casa: "Vitória Casa",
  Fora: "Vitória Fora",
  Empate: "Empate",
  CasaEmpate: "Casa ou Empate",
  ForaEmpate: "Fora ou Empate",
};

export function FeaturedCarousel() {
  const [featured, setFeatured] = useState<FeaturedGame[]>([]);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    fetchGames("hoje")
      .then(async (games) => {
        const sorted = [...games].sort((a, b) => {
          if (isLive(a.status) && !isLive(b.status)) return -1;
          if (!isLive(a.status) && isLive(b.status)) return 1;
          return 0;
        });
        const top = sorted.slice(0, 5);
        const items = await Promise.all(
          top.map(async (game) => {
            try {
              const analysis = await fetchAnalysis(game.id);
              return { game, analysis };
            } catch {
              return { game, analysis: null };
            }
          })
        );
        setFeatured(items);
      })
      .catch(() => {});
  }, []);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelect]);

  if (featured.length === 0) return null;

  return (
    <div className="px-3 pt-3">
      <div className="overflow-hidden rounded-xl" ref={emblaRef}>
        <div className="flex gap-3">
          {featured.map(({ game, analysis }) => (
            <Link
              key={game.id}
              href={`/jogo/${game.id}`}
              className="relative flex-none w-[280px] sm:w-[320px] bg-gradient-to-br from-bg-card to-bg-sidebar rounded-xl p-4 border border-border-subtle hover:border-brand-primary/50 transition-colors overflow-hidden"
            >
              {/* Badge de liga */}
              <div className="flex items-center justify-between mb-3">
                <LeagueBadge league={game.league} />
                {isLive(game.status) && <LiveIndicator clock={game.clock} />}
              </div>

              {/* Times */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <TeamColumn logo={game.home_logo} name={game.home_team} score={game.home_score} />
                <div className="text-center shrink-0">
                  {isLive(game.status) || game.status === "finished" ? (
                    <span className="text-2xl font-black text-white tabular-nums">
                      {game.home_score ?? 0} – {game.away_score ?? 0}
                    </span>
                  ) : (
                    <span className="text-text-muted text-sm font-medium">vs</span>
                  )}
                </div>
                <TeamColumn logo={game.away_logo} name={game.away_team} score={game.away_score} right />
              </div>

              {/* Análise IA */}
              {analysis ? (
                <div className="bg-bg-base/60 rounded-lg p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-text-muted uppercase tracking-wide">IA prevê</span>
                    <ConfidenceBadge confidence={analysis.resultado.c} />
                  </div>
                  <p className="text-sm font-semibold text-white">
                    {RESULT_LABEL[analysis.resultado.r] ?? analysis.resultado.r}
                  </p>
                  <p className="text-[11px] text-text-muted line-clamp-2">{analysis.resultado.just}</p>
                </div>
              ) : (
                <div className="bg-bg-base/60 rounded-lg p-3">
                  <p className="text-[11px] text-text-muted text-center">Análise em breve</p>
                </div>
              )}

              {/* Odds */}
              {game.has_odds && (
                <div className="flex gap-2 mt-3">
                  <OddPill label="Casa" value={game.odds_home} />
                  <OddPill label="Empate" value={game.odds_draw} />
                  <OddPill label="Fora" value={game.odds_away} />
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Dots */}
      {featured.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-2">
          {featured.map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                i === selectedIndex ? "bg-brand-primary" : "bg-border-subtle"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TeamColumn({
  logo,
  name,
  score,
  right,
}: {
  logo: string;
  name: string;
  score: number | null;
  right?: boolean;
}) {
  return (
    <div className={`flex flex-col items-center gap-1.5 w-20 ${right ? "items-center" : "items-center"}`}>
      <div className="relative w-10 h-10">
        <Image src={logo} alt={name} fill sizes="40px" className="object-contain" />
      </div>
      <span className="text-[11px] text-text-secondary text-center leading-tight line-clamp-2">{name}</span>
    </div>
  );
}

function OddPill({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="flex-1 bg-odds-bg rounded px-2 py-1.5 text-center">
      <p className="text-[10px] text-text-muted mb-0.5">{label}</p>
      <p className="text-xs font-bold text-odds-text">{value?.toFixed(2) ?? "—"}</p>
    </div>
  );
}
