"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Jogos" },
  { href: "/ao-vivo", label: "Ao Vivo" },
  { href: "/bingos", label: "Bingos" },
  { href: "/historico", label: "Histórico" },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-bg-header border-b border-border-subtle h-14 flex items-center px-4 gap-4">
      <Link href="/" className="shrink-0">
        <Image
          src="/logo.svg"
          alt="Royaltips"
          width={130}
          height={34}
          priority
          className="object-contain"
        />
      </Link>

      <nav className="hidden md:flex items-center gap-0.5 flex-1">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "px-3 py-1.5 rounded text-sm font-medium transition-colors",
              pathname === link.href
                ? "text-white bg-bg-card"
                : "text-text-secondary hover:text-white hover:bg-bg-card/50"
            )}
          >
            {link.label}
            {link.href === "/ao-vivo" && (
              <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-live-red animate-pulse_live" />
            )}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-2 ml-auto">
        <Link
          href="/login"
          className="text-text-secondary hover:text-white text-sm font-medium transition-colors px-3 py-1.5 hidden sm:block"
        >
          Entrar
        </Link>
        <Link
          href="/assinatura"
          className="bg-brand-primary hover:bg-brand-hover text-white text-sm font-bold px-4 py-1.5 rounded transition-colors"
        >
          Assinar
        </Link>
      </div>
    </header>
  );
}
