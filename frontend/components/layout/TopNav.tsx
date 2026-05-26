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
    <header
      className="sticky top-0 z-50 h-14 flex items-center px-5 gap-5"
      style={{
        background: "#0D121F",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 4px 32px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      {/* Logo */}
      <Link href="/" className="shrink-0">
        <Image
          src="/logo-v2.png"
          alt="Royaltips"
          width={180}
          height={46}
          priority
          className="object-contain"
        />
      </Link>

      {/* Nav links */}
      <nav className="hidden md:flex items-center gap-1 flex-1">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "relative px-4 py-1.5 rounded-xl text-sm font-medium transition-all duration-200",
              pathname === link.href
                ? "nav-item-emboss text-white"
                : "text-text-secondary hover:text-white hover:bg-white/5 rounded-xl"
            )}
          >
            {link.label}
            {link.href === "/ao-vivo" && (
              <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-live-red animate-pulse_live" />
            )}
          </Link>
        ))}
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-2.5 ml-auto">
        <Link
          href="/login"
          className="hidden sm:block text-text-secondary hover:text-white text-sm font-medium transition-colors px-3 py-1.5 rounded-xl hover:bg-white/5"
        >
          Entrar
        </Link>
        <Link
          href="/assinatura"
          className="relative text-white text-sm font-bold px-5 py-2 rounded-xl transition-all duration-200 nav-item-emboss-brand"
        >
          Assinar
        </Link>
      </div>
    </header>
  );
}
