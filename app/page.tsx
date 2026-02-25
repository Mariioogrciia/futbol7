import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { TeamSection } from "@/components/team-section";
import { MatchesSection } from "@/components/matches-section";
import { TopScorersSection } from "@/components/top-scorers";
import { StandingsSection } from "@/components/standings-section";
import { StatsSection } from "@/components/stats-section";
import { GallerySection } from "@/components/gallery-section";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <TeamSection />
      <MatchesSection />
      <TopScorersSection />
      <StandingsSection />
      <StatsSection />
      <GallerySection />
      <Footer />
    </main>
  );
}
