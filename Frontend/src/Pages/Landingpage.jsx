import Navbar from "../Components/Navbar";
import HeroSection from "../Components/HeroSection";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050714] font-sans">
      <Navbar />
      <main>
        <HeroSection />
      </main>
    </div>
  );
}