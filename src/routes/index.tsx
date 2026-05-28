import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { MarketPhilosophy } from "@/components/site/MarketPhilosophy";
import { MarketView } from "@/components/site/MarketView";
import { ResearchProcess } from "@/components/site/ResearchProcess";
import { DailyAnalysis } from "@/components/site/DailyAnalysis";
import { ResearchPerformance } from "@/components/site/ResearchPerformance";
import { WeeklyPicks } from "@/components/site/WeeklyPicks";
import { WhyUs } from "@/components/site/WhyUs";
import { Learn } from "@/components/site/Learn";
import { YouTube } from "@/components/site/YouTube";
import { Testimonials } from "@/components/site/Testimonials";
import { Pricing } from "@/components/site/Pricing";
import { Contact } from "@/components/site/Contact";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <Hero />
      <MarketPhilosophy />
      <MarketView />
      <ResearchProcess />
      <DailyAnalysis />
      <ResearchPerformance />
      <WeeklyPicks />
      <WhyUs />
      <Learn />
      <YouTube />
      <Testimonials />
      <Pricing />
      <Contact />
      <Footer />
    </main>
  );
}
