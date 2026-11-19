/**
 * page.tsx - the HOME page (the address "/").
 * It stacks the home page sections in order, top to bottom.
 * Each section lives in its own file in components/home/.
 * <Reveal> makes a section fade up when it scrolls into view.
 */
import { HeroSlider } from "@/components/home/HeroSlider";
import { Stats } from "@/components/home/Stats";
import { AreaMarquee } from "@/components/home/AreaMarquee";
import { ExploreCards } from "@/components/home/ExploreCards";
import { HowItWorks } from "@/components/home/HowItWorks";
import { NearbyAlerts } from "@/components/home/NearbyAlerts";
import { ReportBanner } from "@/components/home/ReportBanner";
import { PhoneShowcase } from "@/components/home/PhoneShowcase";
import { Faq } from "@/components/home/Faq";
import { Reveal } from "@/components/Reveal";

export default function HomePage() {
  return (
    <>
      <HeroSlider />
      <Stats />
      <AreaMarquee />
      <Reveal>
        <ExploreCards />
      </Reveal>
      <Reveal>
        <HowItWorks />
      </Reveal>
      <Reveal>
        <PhoneShowcase />
      </Reveal>
      <Reveal>
        <NearbyAlerts />
      </Reveal>
      <Reveal>
        <Faq />
      </Reveal>
      <Reveal>
        <ReportBanner />
      </Reveal>
    </>
  );
}
