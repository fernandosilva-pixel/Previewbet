"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ConfidenceBadge } from "@/components/ui/ConfidenceBadge";
import { fetchActiveAlerts, fetchBingos } from "@/lib/api";
import type { LiveAlert, Bingo } from "@/lib/types";

export function RightPanel() {
  const [alerts, setAlerts] = useState<LiveAlert[]>([]);
  const [bingos, setBingos] = useState<Bingo[]>([]);

  useEffect(() => {
    fetchActiveAlerts().then(setAlerts).catch(() => {});
    fetchBingos().then(setBingos).catch(() => {});
  }, []);

  return (
    <aside className="hidden lg:flex flex-col w-[300px] shrink-0 border-l border-border-subtle overflow-y-auto">
      {/* Alertas ao vivo */}
      <div className="border-b border-border-subtle">
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="text-sm font-semibold text-white">Alertas Ao Vivo</h2>
          <span className="w-2 h-2 rounded-full bg-live-red animate-pulse_live" />
        </div>

        {alerts.length === 0 ? (
          <p className="px-4 pb-4 text-xs text-text-muted">Nenhum alerta ativo no momento.</p>
        ) : (
          <div className="space-y-0 divide-y divide-border-subtle">
            {alerts.map((alert) => (
              <div key={alert.id} className="px-4 py-3 hover:bg-bg-card/50 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-xs font-semibold text-white leading-tight">
                    {alert.home} {alert.home_score}–{alert.away_score} {alert.away}
                  </p>
                  <ConfidenceBadge confidence={alert.confidence} />
                </div>
                <p className="text-[11px] text-brand-primary font-medium mb-1">{alert.market}</p>
                <p className="text-[11px] text-text-muted line-clamp-2">{alert.signal}</p>
                <div className="flex gap-3 mt-2 text-[10px] text-text-muted">
                  <span>Posse: {alert.pressure.possession}</span>
                  <span>Chutes: {alert.pressure.shots}</span>
                  <span>Escanteios: {alert.pressure.corners}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bingos do dia */}
      <div>
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="text-sm font-semibold text-white">Bingos de Hoje</h2>
          <Link href="/bingos" className="text-[11px] text-brand-primary hover:underline">
            Ver todos
          </Link>
        </div>

        {bingos.length === 0 ? (
          <p className="px-4 pb-4 text-xs text-text-muted">Nenhum bingo disponível.</p>
        ) : (
          <div className="space-y-0 divide-y divide-border-subtle">
            {bingos.slice(0, 3).map((bingo) => (
              <Link
                key={bingo.id}
                href="/bingos"
                className="block px-4 py-3 hover:bg-bg-card/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-xs font-semibold text-white leading-tight">{bingo.name}</p>
                  <TierBadge tier={bingo.tier} />
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="text-odds-text font-bold">@{bingo.total_odd.toFixed(2)}</span>
                  <span className="text-text-muted">{bingo.confidence_pct}% confiança</span>
                  <span className="text-text-muted">{bingo.selections.length} seleções</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* CTA assinatura */}
      <div className="mt-auto p-4">
        <div className="bg-gradient-to-br from-brand-primary/20 to-bg-card rounded-xl p-4 border border-brand-primary/30 text-center">
          <p className="text-sm font-bold text-white mb-1">Acesso Completo</p>
          <p className="text-[11px] text-text-muted mb-3">
            Análises ilimitadas, alertas ao vivo e bingos exclusivos da IA.
          </p>
          <Link
            href="/assinatura"
            className="block bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold py-2 rounded transition-colors"
          >
            Assinar Agora — R$19,90/sem
          </Link>
        </div>
      </div>
    </aside>
  );
}

function TierBadge({ tier }: { tier: string }) {
  const styles: Record<string, string> = {
    seguro: "text-success-green border-success-green/40 bg-success-green/10",
    moderado: "text-warning-amber border-warning-amber/40 bg-warning-amber/10",
    risco: "text-live-red border-live-red/40 bg-live-red/10",
  };
  const labels: Record<string, string> = {
    seguro: "Seguro",
    moderado: "Moderado",
    risco: "Risco",
  };
  return (
    <span
      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${styles[tier] ?? ""}`}
    >
      {labels[tier] ?? tier}
    </span>
  );
}
