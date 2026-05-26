// Página raiz — redirecionará para o layout principal na etapa 6
export default function HomePage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-brand-primary">Oraculous Bet</h1>
        <p className="text-text-secondary">Plataforma de palpites com IA — em construção</p>
        <div className="flex gap-2 justify-center">
          <div className="w-2 h-2 rounded-full bg-brand-primary animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 rounded-full bg-brand-primary animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 rounded-full bg-brand-primary animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}
