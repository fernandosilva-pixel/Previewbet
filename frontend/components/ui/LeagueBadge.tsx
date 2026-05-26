const LEAGUE_FLAGS: Record<string, string> = {
  "Brasileirão Série A": "🇧🇷",
  "CONMEBOL Libertadores": "🌎",
  "CONMEBOL Sul-Americana": "🌎",
  "Premier League": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  "La Liga": "🇪🇸",
  "Serie A": "🇮🇹",
  "Bundesliga": "🇩🇪",
  "Ligue 1": "🇫🇷",
};

export function LeagueBadge({ league }: { league: string }) {
  const flag = LEAGUE_FLAGS[league] ?? "⚽";
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-text-muted bg-bg-base px-1.5 py-0.5 rounded">
      <span>{flag}</span>
      <span className="truncate max-w-[100px]">{league}</span>
    </span>
  );
}
