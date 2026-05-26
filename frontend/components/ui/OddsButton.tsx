"use client";

import { cn } from "@/lib/utils";

interface OddsButtonProps {
  label: string;
  value: number | null;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export function OddsButton({ label, value, selected, disabled, onClick }: OddsButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || value === null}
      className={cn(
        "flex flex-col items-center justify-center px-3 py-2 rounded border transition-all duration-200 min-w-[60px]",
        selected
          ? "bg-brand-primary border-brand-primary text-white"
          : "bg-odds-bg border-odds-border text-odds-text hover:bg-odds-bg-hover hover:scale-[1.02]",
        (disabled || value === null) && "opacity-40 cursor-not-allowed"
      )}
    >
      <span className="text-[11px] text-text-secondary mb-0.5 leading-none">{label}</span>
      <span className="text-[15px] font-bold leading-none">
        {value !== null ? value.toFixed(2) : "-"}
      </span>
    </button>
  );
}
