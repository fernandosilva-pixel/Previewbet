"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Jogos de Hoje", icon: "⚽" },
  { href: "/ao-vivo", label: "Ao Vivo", icon: "🔴", badge: "AO VIVO" },
  { href: "/bingos", label: "Bingos IA", icon: "🎯" },
  { href: "/historico", label: "Histórico", icon: "📊" },
  { href: "/assinatura", label: "Assinar", icon: "⭐" },
];

const LEAGUES = [
  { name: "Brasileirão Série A", flag: "🇧🇷" },
  { name: "CONMEBOL Libertadores", flag: "🌎" },
  { name: "CONMEBOL Sul-Americana", flag: "🌎" },
  { name: "Premier League", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { name: "La Liga", flag: "🇪🇸" },
  { name: "Serie A", flag: "🇮🇹" },
  { name: "Bundesliga", flag: "🇩🇪" },
  { name: "Ligue 1", flag: "🇫🇷" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-[220px] shrink-0 bg-bg-sidebar border-r border-border-subtle overflow-y-auto">
      <div className="p-3 space-y-0.5">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded text-sm transition-colors",
              pathname === item.href
                ? "bg-bg-card text-white font-medium"
                : "text-text-secondary hover:text-white hover:bg-bg-card/50"
            )}
          >
            <span className="text-base">{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <span className="text-[9px] bg-live-red text-white px-1.5 py-0.5 rounded font-bold tracking-wide">
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </div>

      <div className="mt-2 px-3">
        <p className="text-[10px] text-text-muted uppercase tracking-widest font-semibold mb-2 px-3">
          Ligas
        </p>
        <div className="space-y-0.5">
          {LEAGUES.map((l) => (
            <button
              key={l.name}
              className="w-full flex items-center gap-2 px-3 py-1.5 rounded text-sm text-text-secondary hover:text-white hover:bg-bg-card/50 transition-colors text-left"
            >
              <span className="text-base">{l.flag}</span>
              <span className="truncate text-xs">{l.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-auto p-4 border-t border-border-subtle">
        <div className="bg-bg-card rounded-lg p-3 text-center">
          <p className="text-text-muted text-[10px] uppercase tracking-wide mb-1">Acurácia Geral</p>
          <p className="text-2xl font-bold text-success-green">69.8%</p>
          <p className="text-text-muted text-[10px] mt-0.5">248 palpites</p>
        </div>
      </div>
    </aside>
  );
}
