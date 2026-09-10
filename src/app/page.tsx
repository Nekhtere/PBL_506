import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import DealsSection from "@/components/DealsSection";
import ItinerarySection from "@/components/ItinerarySection";
import RideGuideSection from "@/components/RideGuideSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FBFBFD]">
      <Navbar />
      <HeroSection />
      <DealsSection />
      <ItinerarySection />
      <RideGuideSection />
      <HowItWorksSection />
      <Footer />
    </main>
  );
}
