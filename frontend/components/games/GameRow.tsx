"use client";

import Link from "next/link";
import Image from "next/image";
import { ConfidenceBadge } from "@/components/ui/ConfidenceBadge";
import { LiveIndicator } from "@/components/ui/LiveIndicator";
import { cn, formatLocalTime } from "@/lib/utils";
import type { Game, Analysis } from "@/lib/types";

interface GameRowProps {
  game: Game;
  analysis?: Analysis | null;
  logoMap?: Record<string, string>;
}

export function GameRow({ game, analysis, logoMap }: GameRowProps) {
  const homeLogo = game.homeLogo || logoMap?.[game.home] || "";
  const awayLogo = game.awayLogo || logoMap?.[game.away] || "";

  return (
    <Link
      href={`/jogo/${game.id}`}
      className="flex items-center gap-3 px-4 py-3 border-b border-border-subtle hover:bg-bg-card-hover transition-colors"
    >
      {/* Horário / Status */}
      <div className="w-16 shrink-0">
        {game.isLive ? (
          <LiveIndicator clock={game.clock} />
        ) : game.isFinal ? (
          <span className="text-text-muted text-xs font-medium">Fim</span>
        ) : (
          <span className="text-text-secondary text-sm font-semibold tabular-nums">
            {formatLocalTime(game.datetime)}
          </span>
        )}
      </div>

      {/* Times */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <TeamLine
          logo={homeLogo}
          name={game.home}
          score={game.homeScore}
          showScore={game.isLive || game.isFinal}
          winning={game.isLive || game.isFinal ? game.homeScore > game.awayScore : false}
        />
        <TeamLine
          logo={awayLogo}
          name={game.away}
          score={game.awayScore}
          showScore={game.isLive || game.isFinal}
          winning={game.isLive || game.isFinal ? game.awayScore > game.homeScore : false}
        />
      </div>

      {/* Liga */}
      <div className="hidden sm:block w-24 shrink-0 text-right">
        <span className="text-[11px] text-text-muted truncate">{game.leagueShort || game.league}</span>
      </div>

      {/* IA badge */}
      <div className="w-14 shrink-0 flex justify-end">
        {analysis ? (
          <ConfidenceBadge confidence={analysis.resultado.c} />
        ) : (
          <span className="text-text-muted text-xs">—</span>
        )}
      </div>
    </Link>
  );
}

function TeamLine({
  logo,
  name,
  score,
  showScore,
  winning,
}: {
  logo: string;
  name: string;
  score: number;
  showScore: boolean;
  winning: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      {logo ? (
        <div className="w-5 h-5 relative shrink-0">
          <Image
            src={logo}
            alt={name}
            fill
            sizes="20px"
            className="object-contain"
            unoptimized
          />
        </div>
      ) : (
        <div className="w-5 h-5 shrink-0 rounded-full bg-bg-card-hover" />
      )}
      <span
        className={cn(
          "text-sm truncate flex-1",
          winning ? "text-white font-semibold" : "text-text-secondary"
        )}
      >
        {name}
      </span>
      {showScore && (
        <span
          className={cn(
            "text-sm font-bold tabular-nums ml-auto",
            winning ? "text-white" : "text-text-muted"
          )}
        >
          {score}
        </span>
      )}
    </div>
  );
}
