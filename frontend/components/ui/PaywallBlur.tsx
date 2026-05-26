"use client";

import Link from "next/link";

interface PaywallBlurProps {
  children: React.ReactNode;
}

export function PaywallBlur({ children }: PaywallBlurProps) {
  return (
    <div className="relative">
      <div className="paywall-blur">{children}</div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-bg-base/60 backdrop-blur-[2px]">
        <span className="text-xl">🔒</span>
        <Link
          href="/assinatura"
          className="bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold px-3 py-1.5 rounded transition-colors"
        >
          ASSINAR
        </Link>
      </div>
    </div>
  );
}
