import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Oraculous Bet — Palpites de futebol com IA",
  description: "Análises de futebol geradas por inteligência artificial. Palpites com alta acurácia para os principais campeonatos.",
  keywords: ["palpites futebol", "análise IA", "apostas esportivas", "brasileirão", "premier league"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="min-h-screen bg-bg-base">{children}</body>
    </html>
  );
}
