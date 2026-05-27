"use client";

import { useEffect, useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import Link from "next/link";
import { ConfidenceBadge } from "@/components/ui/ConfidenceBadge";
import { LiveIndicator } from "@/components/ui/LiveIndicator";
import { LeagueBadge } from "@/components/ui/LeagueBadge";
import { fetchGames, fetchAnalysis } from "@/lib/api";
import { formatLocalTime } from "@/lib/utils";
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
    fetchGames()
      .then(async (games) => {
        // Prioriza ao vivo, depois os mais próximos
        const sorted = [...games].sort((a, b) => {
          if (a.isLive && !b.isLive) return -1;
          if (!a.isLive && b.isLive) return 1;
          return new Date(a.datetime).getTime() - new Date(b.datetime).getTime();
        });

        const top = sorted.filter((g) => !g.isFinal).slice(0, 5);

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
    <div className="px-3 pt-4">
      <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
        <div className="flex gap-3">
          {featured.map(({ game, analysis }) => (
            <Link
              key={game.id}
              href={`/jogo/${game.id}`}
              className="relative flex-none w-[280px] sm:w-[320px] rounded-2xl p-4 overflow-hidden transition-all hover:scale-[1.01]"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)",
                border: "1px solid rgba(255,255,255,0.09)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
              }}
            >
              {/* Liga + Status */}
              <div className="flex items-center justify-between mb-3">
                <LeagueBadge league={game.leagueShort || game.league} />
                {game.isLive
                  ? <LiveIndicator clock={game.clock} />
                  : <span className="text-text-muted text-xs">{formatLocalTime(game.datetime)}</span>
                }
              </div>

              {/* Times */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <TeamCol logo={game.homeLogo} name={game.home} score={game.homeScore} showScore={game.isLive || game.isFinal} />
                <div className="text-center shrink-0">
                  {game.isLive || game.isFinal ? (
                    <span className="text-2xl font-black text-white tabular-nums">
                      {game.homeScore} – {game.awayScore}
                    </span>
                  ) : (
                    <span className="text-text-muted text-sm font-bold">vs</span>
                  )}
                </div>
                <TeamCol logo={game.awayLogo} name={game.away} score={game.awayScore} showScore={game.isLive || game.isFinal} right />
              </div>

              {/* Análise IA */}
              {analysis ? (
                <div className="rounded-xl p-3 space-y-1"
                  style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-text-muted uppercase tracking-wide">IA prevê</span>
                    <ConfidenceBadge confidence={analysis.resultado.c} />
                  </div>
                  <p className="text-sm font-semibold text-white">
                    {RESULT_LABEL[analysis.resultado.r] ?? analysis.resultado.r}
                  </p>
                  <p className="text-[11px] text-text-muted line-clamp-2">{analysis.resultado.just}</p>
                </div>
              ) : (
                <div className="rounded-xl p-3 text-center"
                  style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <p className="text-[11px] text-text-muted">Análise IA em breve</p>
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Dots */}
      {featured.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {featured.map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === selectedIndex ? "w-4 bg-brand-primary" : "w-1.5 bg-white/20"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TeamCol({
  logo, name, score, showScore, right,
}: {
  logo: string; name: string; score: number; showScore: boolean; right?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 w-24">
      <div className="relative w-10 h-10">
        {logo ? (
          <Image src={logo} alt={name} fill sizes="40px" className="object-contain" unoptimized />
        ) : (
          <div className="w-10 h-10 rounded-full bg-bg-card-hover" />
        )}
      </div>
      <span className="text-[11px] text-text-secondary text-center leading-tight line-clamp-2">{name}</span>
      {showScore && <span className="text-lg font-black text-white">{score}</span>}
    </div>
  );
}
