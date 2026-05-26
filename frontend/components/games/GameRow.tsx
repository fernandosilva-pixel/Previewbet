"use client";

import Link from "next/link";
import Image from "next/image";
import { OddsButton } from "@/components/ui/OddsButton";
import { ConfidenceBadge } from "@/components/ui/ConfidenceBadge";
import { LiveIndicator } from "@/components/ui/LiveIndicator";
import { cn, formatGameTime, isLive, isFinished } from "@/lib/utils";
import type { Game, Analysis } from "@/lib/types";

interface GameRowProps {
  game: Game;
  analysis?: Analysis | null;
}

export function GameRow({ game, analysis }: GameRowProps) {
  const live = isLive(game.status);
  const finished = isFinished(game.status);

  return (
    <Link
      href={`/jogo/${game.id}`}
      className="flex items-center gap-3 px-4 py-3 border-b border-border-subtle hover:bg-bg-card-hover transition-colors"
    >
      {/* Horário / Status */}
      <div className="w-14 shrink-0">
        {live ? (
          <LiveIndicator clock={game.clock} />
        ) : finished ? (
          <span className="text-text-muted text-xs font-medium">Fim</span>
        ) : (
          <span className="text-text-secondary text-sm font-semibold tabular-nums">
            {formatGameTime(game.datetime)}
          </span>
        )}
      </div>

      {/* Times */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <TeamLine
          logo={game.home_logo}
          name={game.home_team}
          score={game.home_score}
          live={live}
          finished={finished}
          winning={
            game.home_score !== null &&
            game.away_score !== null &&
            game.home_score > game.away_score
          }
        />
        <TeamLine
          logo={game.away_logo}
          name={game.away_team}
          score={game.away_score}
          live={live}
          finished={finished}
          winning={
            game.home_score !== null &&
            game.away_score !== null &&
            game.away_score > game.home_score
          }
        />
      </div>

      {/* Odds */}
      <div className="flex gap-1 shrink-0">
        <OddsButton label="1" value={game.odds_home} disabled={finished} />
        <OddsButton label="X" value={game.odds_draw} disabled={finished} />
        <OddsButton label="2" value={game.odds_away} disabled={finished} />
      </div>

      {/* IA */}
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
  live,
  finished,
  winning,
}: {
  logo: string;
  name: string;
  score: number | null;
  live: boolean;
  finished: boolean;
  winning: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 relative shrink-0">
        <Image
          src={logo}
          alt={name}
          fill
          sizes="16px"
          className="object-contain"
        />
      </div>
      <span
        className={cn(
          "text-sm truncate",
          winning ? "text-white font-semibold" : "text-text-secondary"
        )}
      >
        {name}
      </span>
      {(live || finished) && score !== null && (
        <span
          className={cn(
            "ml-auto text-sm font-bold tabular-nums",
            live ? "text-white" : "text-text-muted"
          )}
        >
          {score}
        </span>
      )}
    </div>
  );
}
