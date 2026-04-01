import { useState } from "react";
import api from "../Api/axios";
import { Form, useNavigate } from "react-router-dom"; 


export default function HeroSection() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [roomcode , setRoomcode] = useState(null)
  const navigate = useNavigate(); 

  const createRoom = async () => {
    try {
      setLoading(true);
      const { data } = await api.post("/room/api/createroom");
      console.log(data);
      navigate(`/${data.roomcode}`); 
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handlejoinroom = () => {
    navigate(`/${roomcode}`)
  }
  return (
    <section className="min-h-screen bg-[#1a1a1a] flex items-center justify-center px-6">
      <div className="flex flex-col items-center text-center gap-7 max-w-lg w-full">

        {/* Eyebrow tag */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
          <span className="text-orange-400 text-xs font-medium tracking-widest">VIDEO · COLLAB · AI</span>
        </div>

        {/* Heading */}
        <div className="flex flex-col gap-3">
          <h1 className="text-5xl sm:text-6xl font-bold text-[#e8e8e8] leading-[1.1] tracking-tight">
            Meet without
            <br />
            <span className="text-orange-400">boundaries.</span>
          </h1>
          <p className="text-[#777] text-base leading-relaxed max-w-sm mx-auto">
            HD video, real-time collaboration, and AI-powered tools — all in one place.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs w-full max-w-xs">
            {error}
          </div>
        )}

        {/* Start Instant Meeting Button */}
        <button
          onClick={createRoom}
          disabled={loading}
          className="group flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-400 active:scale-95 transition-all duration-150 shadow-lg shadow-orange-500/20 w-full max-w-xs justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
            <rect x="1" y="4" width="10" height="8" rx="2" fill="white" opacity="0.95" />
            <path d="M12 7l4-2.5v8L12 10V7z" fill="white" opacity="0.9" />
          </svg>
          {loading ? "Creating..." : "Start Instant Meeting"}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 w-full max-w-xs">
          <div className="flex-1 h-px bg-white/8" />
          <span className="text-[#444] text-xs tracking-widest">OR</span>
          <div className="flex-1 h-px bg-white/8" />
        </div>

        {/* Join Meeting Input */}
        <div className="flex items-center w-full max-w-xs rounded-xl bg-[#242424] border border-white/8 overflow-hidden focus-within:border-orange-500/40 focus-within:ring-1 focus-within:ring-orange-500/20 transition-all duration-150">
          <div className="flex items-center gap-2 flex-1 px-4 py-3">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-[#555] shrink-0">
              <rect x="1.5" y="1.5" width="11" height="11" rx="2.5" stroke="currentColor" strokeWidth="1.3" />
              <path d="M4.5 7h5M7 4.5v5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
           <input
  name="roomcode"
  value={roomcode || ""}
  onChange={(e) => setRoomcode(e.target.value)}
  type="text"
  placeholder="Enter a code or link"
  className="flex-1 bg-transparent text-[#d4d4d4] text-sm placeholder-[#444] outline-none"
/>
          </div>
          <button onClick={handlejoinroom}  className="px-4 py-3 text-sm font-semibold text-orange-400 hover:text-orange-300 hover:bg-orange-500/5 transition-colors duration-150 border-l border-white/8">
            Join
          </button>
        </div>

        {/* Bottom note */}
        <p className="text-[#444] text-xs">No account needed to join a meeting.</p>

        {/* Stats row */}
        <div className="flex items-center gap-8 pt-2 border-t border-white/8 w-full max-w-xs justify-center">
          {[
            { value: "HD", label: "Video Quality" },
            { value: "50+", label: "Participants" },
            { value: "AI", label: "Powered" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-0.5">
              <span className="text-orange-400 text-sm font-bold">{stat.value}</span>
              <span className="text-[#555] text-xs">{stat.label}</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}