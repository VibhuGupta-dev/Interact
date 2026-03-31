// pages/LandingPage.jsx

import Navbar from "../Components/Navbar";
import HeroSection from "../Components/HeroSection"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050714] font-sans">
      <link
        href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500&display=swap"
        rel="stylesheet"
      />  
      <Navbar />  
      <main>
        <HeroSection />
      </main>
    </div>
  );
}