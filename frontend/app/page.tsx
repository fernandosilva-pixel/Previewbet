import { TopNav } from "@/components/layout/TopNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { RightPanel } from "@/components/layout/RightPanel";
import { FeaturedCarousel } from "@/components/games/FeaturedCarousel";
import { GameList } from "@/components/games/GameList";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <TopNav />

      <div className="flex flex-1 overflow-hidden" style={{ height: "calc(100vh - 56px)" }}>
        <Sidebar />

        <main className="flex-1 overflow-y-auto">
          <FeaturedCarousel />
          <GameList />
        </main>

        <RightPanel />
      </div>

      <MobileNav />
    </div>
  );
}
