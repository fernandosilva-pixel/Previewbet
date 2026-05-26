"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Jogos de Hoje", icon: "⚽" },
  { href: "/ao-vivo", label: "Ao Vivo", icon: "🔴", badge: "AO VIVO" },
  { href: "/carteira", label: "Carteira", icon: "💰" },
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
    <aside
      className="hidden md:flex flex-col w-[230px] shrink-0 overflow-y-auto glass border-r-0"
      style={{
        background: "linear-gradient(180deg, rgba(15,19,32,0.8) 0%, rgba(12,16,28,0.9) 100%)",
        backdropFilter: "blur(28px) saturate(180%)",
        WebkitBackdropFilter: "blur(28px) saturate(180%)",
        borderRight: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "4px 0 24px rgba(0,0,0,0.4)",
      }}
    >
      {/* Navigation */}
      <div className="p-3 space-y-1.5 mt-1">
        <p className="text-[10px] text-text-muted uppercase tracking-[0.15em] font-semibold px-3 mb-3 mt-1">
          Menu
        </p>
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200",
                active
                  ? "nav-item-emboss-brand text-white font-semibold"
                  : "text-text-secondary hover:text-white nav-item-emboss"
              )}
            >
              <span className="text-base leading-none">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span
                  className="text-[9px] px-1.5 py-0.5 rounded-md font-bold tracking-wide text-white"
                  style={{
                    background: "rgba(229, 62, 62, 0.9)",
                    boxShadow: "0 2px 8px rgba(229,62,62,0.5)",
                  }}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Divider */}
      <div
        className="mx-4 my-2"
        style={{
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
        }}
      />

      {/* Leagues */}
      <div className="px-3 pb-3">
        <p className="text-[10px] text-text-muted uppercase tracking-[0.15em] font-semibold px-3 mb-2">
          Ligas
        </p>
        <div className="space-y-1">
          {LEAGUES.map((l) => (
            <button
              key={l.name}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-text-secondary hover:text-white transition-all duration-200 nav-item-emboss text-left"
            >
              <span className="text-sm">{l.flag}</span>
              <span className="truncate">{l.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div
        className="mx-4 my-2"
        style={{
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
        }}
      />

      {/* Indicação */}
      <div className="px-3 pb-3">
        <p className="text-[10px] text-text-muted uppercase tracking-[0.15em] font-semibold px-3 mb-2">
          Indicação
        </p>
        <Link
          href="/indicacao"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 mb-1.5",
            pathname === "/indicacao"
              ? "nav-item-emboss-brand text-white font-semibold"
              : "text-text-secondary hover:text-white nav-item-emboss"
          )}
        >
          <span className="text-base leading-none">🔗</span>
          <span className="flex-1">Meu Link</span>
        </Link>
        <Link
          href="/indicacao/ganhos"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200",
            pathname === "/indicacao/ganhos"
              ? "nav-item-emboss-brand text-white font-semibold"
              : "text-text-secondary hover:text-white nav-item-emboss"
          )}
        >
          <span className="text-base leading-none">💸</span>
          <span className="flex-1">Ganhos</span>
        </Link>

        {/* Banner de incentivo */}
        <div
          className="mt-3 rounded-2xl p-3 text-center"
          style={{
            background: "linear-gradient(135deg, rgba(224,82,42,0.15) 0%, rgba(224,82,42,0.05) 100%)",
            border: "1px solid rgba(224,82,42,0.2)",
            boxShadow: "inset 0 1px 1px rgba(255,180,100,0.1), 0 4px 12px rgba(0,0,0,0.3)",
          }}
        >
          <p className="text-[18px] mb-1">👑</p>
          <p className="text-[11px] text-white font-semibold mb-0.5">Ganhe por indicar</p>
          <p className="text-[10px] text-text-muted leading-snug">
            Compartilhe seu link e receba comissão por cada assinante.
          </p>
          <Link
            href="/indicacao"
            className="inline-block mt-2 text-[10px] font-bold text-brand-primary hover:underline"
          >
            Começar agora →
          </Link>
        </div>
      </div>

      {/* Divider */}
      <div
        className="mx-4 my-1"
        style={{
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
        }}
      />

      {/* Accuracy badge */}
      <div className="p-4 mt-auto">
        <div
          className="rounded-2xl p-4 text-center"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow:
              "inset 0 1px 1px rgba(255,255,255,0.1), inset 0 -1px 1px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.4)",
          }}
        >
          <p className="text-[10px] text-text-muted uppercase tracking-widest mb-1.5">
            Acurácia Geral
          </p>
          <p
            className="text-3xl font-black"
            style={{
              background: "linear-gradient(135deg, #4ade80, #22c55e)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 8px rgba(74,222,128,0.4))",
            }}
          >
            69.8%
          </p>
          <p className="text-[10px] text-text-muted mt-1">248 palpites</p>
        </div>
      </div>
    </aside>
  );
}
