"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const MOBILE_NAV = [
  { href: "/", label: "Jogos", icon: "⚽" },
  { href: "/ao-vivo", label: "Ao Vivo", icon: "🔴" },
  { href: "/bingos", label: "Bingos", icon: "🎯" },
  { href: "/historico", label: "Histórico", icon: "📊" },
  { href: "/assinatura", label: "Assinar", icon: "⭐" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-bg-sidebar border-t border-border-subtle z-50 flex pb-safe">
      {MOBILE_NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
            pathname === item.href ? "text-brand-primary" : "text-text-muted"
          )}
        >
          <span className="text-xl leading-none">{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
