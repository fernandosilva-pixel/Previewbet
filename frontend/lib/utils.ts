import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isToday, isTomorrow, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Confidence, GameStatus } from "./types";

// shadcn/ui helper
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ---------------------------------------------------------------------------
// Formatação de datas
// ---------------------------------------------------------------------------

export function formatGameTime(datetime: string): string {
  const date = parseISO(datetime);
  return format(date, "HH:mm", { locale: ptBR });
}

export function formatGameDate(datetime: string): string {
  const date = parseISO(datetime);
  if (isToday(date)) return "Hoje";
  if (isTomorrow(date)) return "Amanhã";
  return format(date, "dd/MM", { locale: ptBR });
}

export function formatFullDate(datetime: string): string {
  return format(parseISO(datetime), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR });
}

// ---------------------------------------------------------------------------
// Odds
// ---------------------------------------------------------------------------

export function formatOdd(odd: number | null | undefined): string {
  if (odd == null) return "-";
  return odd.toFixed(2);
}

// ---------------------------------------------------------------------------
// Status
// ---------------------------------------------------------------------------

export function isLive(status: GameStatus): boolean {
  return status === "live";
}

export function isFinished(status: GameStatus): boolean {
  return status === "finished";
}

// ---------------------------------------------------------------------------
// Confiança
// ---------------------------------------------------------------------------

export function confidenceLabel(c: Confidence): string {
  return { ALTA: "Alta", MEDIA: "Média", BAIXA: "Baixa" }[c] ?? c;
}

export function confidenceColor(c: Confidence): string {
  return {
    ALTA: "text-amber-400 border-amber-700 bg-amber-900/50",
    MEDIA: "text-blue-400 border-blue-700 bg-blue-900/50",
    BAIXA: "text-gray-400 border-gray-700 bg-gray-800",
  }[c] ?? "";
}

// ---------------------------------------------------------------------------
// Forma do time (ex: "VVDVE")
// ---------------------------------------------------------------------------

export type FormChar = "V" | "D" | "E";

export function parseForm(form: string): FormChar[] {
  return form.split("").filter((c): c is FormChar => ["V", "D", "E"].includes(c));
}

export function formColor(char: FormChar): string {
  return { V: "bg-success-green", D: "bg-live-red", E: "bg-text-muted" }[char];
}

// ---------------------------------------------------------------------------
// Preço em centavos → R$
// ---------------------------------------------------------------------------

export function formatPrice(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
