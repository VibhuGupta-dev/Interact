// components/Navbar.jsx

import { useState } from "react";
import LoginModal from "./Loginmodal";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const [loginOpen, setLoginOpen] = useState(false);
  const naivate = useNavigate()

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-10 py-4 bg-[#1a1a1a]/95 backdrop-blur-sm border-b border-white/8">

        {/* Logo - Top Left */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="6" cy="9" r="2.5" fill="white" />
              <circle cx="13" cy="5" r="1.8" fill="white" opacity="0.7" />
              <circle cx="13" cy="13" r="1.8" fill="white" opacity="0.7" />
              <line x1="8.4" y1="9" x2="11.3" y2="6" stroke="white" strokeWidth="1.2" opacity="0.6" />
              <line x1="8.4" y1="9" x2="11.3" y2="12" stroke="white" strokeWidth="1.2" opacity="0.6" />
            </svg>
          </div>
          <span className="text-[#e5e5e5] font-semibold text-base tracking-[0.2em]">INTRACT</span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLoginOpen(true)}
            className="px-4 py-2 text-sm text-[#999] font-medium hover:text-[#e5e5e5] transition-colors duration-150"
          >
            Login
          </button>
          <button 
          onClick={() =>naivate("/signup")}
          className="px-5 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-400 transition-colors duration-150 shadow-md shadow-orange-500/15">
           Sign up free
          </button>
          
           
         
        </div>

      </nav>

      {/* Modal renders here — outside nav but inside Fragment */}
      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}