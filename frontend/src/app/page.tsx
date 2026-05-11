import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import HowItWorks from "@/components/sections/HowItWorks";
import Features from "@/components/sections/Features";
import FAQ from "@/components/sections/FAQ";
import SuccessStories from "@/components/sections/SuccessStories";
import ZigZagSeparator from "@/components/ui/ZigZagSeparator";

import StickySection from "@/components/layout/StickySection";

export default function Home() {
  return (
    <main className="relative bg-[#0a0f1a] min-h-screen overflow-x-clip">
      <Navbar />

      {/* HERO */}
      <StickySection className="z-10">
        <Hero />
      </StickySection>

      {/* HOW IT WORKS - KEPT STICKY ON MOBILE */}
      <StickySection stickyOnMobile className="z-20">
        <ZigZagSeparator color="#0c1220" height={24} />
        <HowItWorks />
      </StickySection>

      {/* FEATURES */}
      <StickySection className="z-30">
        <ZigZagSeparator color="#070b14" height={24} />
        <Features />
      </StickySection>

      {/* SUCCESS STORIES */}
      <StickySection className="z-40">
        <ZigZagSeparator color="#0a0f1a" height={24} />
        <SuccessStories />
      </StickySection>

      {/* FAQ - KEPT STICKY ON MOBILE */}
      <StickySection stickyOnMobile className="z-50 shadow-[0_-20px_50px_rgba(0,0,0,0.3)]">
        <ZigZagSeparator color="#080d16" height={24} />
        <FAQ />
      </StickySection>

      {/* FOOTER */}
      <section className="relative z-[70]">
        <Footer />
      </section>
    </main>
  );
}
