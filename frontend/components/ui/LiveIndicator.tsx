export function LiveIndicator({ clock }: { clock?: string | null }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full bg-live-red animate-pulse_live flex-shrink-0" />
      <span className="text-live-red text-xs font-bold uppercase tracking-wide">Ao Vivo</span>
      {clock && <span className="text-white text-xs font-medium">{clock}&apos;</span>}
    </div>
  );
}
