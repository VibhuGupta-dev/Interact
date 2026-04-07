import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearUser } from "../Redux/Features/UserSlice";

export function PermissionScreen({ name, room, socket }) {
  const [message, setMessage] = useState("Waiting for owner to approve your join request...");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) return;

    // Listeners for this screen
    const handleAccepted = (data) => {
      setMessage("✅ Your request was accepted! Redirecting...");
    };

    const handleRejected = (data) => {
      setMessage(data.message || "❌ Request rejected.");
      setTimeout(() => {
        dispatch(clearUser());
        navigate("/");
      }, 2000);
    };

    socket.on("requestAccepted", handleAccepted);
    socket.on("requestRejected", handleRejected);

    return () => {
      socket.off("requestAccepted", handleAccepted);
      socket.off("requestRejected", handleRejected);
    };
  }, [socket, dispatch, navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-[#1a1a1a]">
      <div className="bg-[#242424] rounded-[40px] shadow-2xl p-10 max-w-md w-full mx-4 border border-white/5 relative overflow-hidden">
        
        {/* Animated Background Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-orange-500/10 blur-[100px] rounded-full"></div>

        {/* Icon Section */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-orange-500/10 rounded-[30px] flex items-center justify-center border border-orange-500/20 shadow-inner">
            <span className="text-4xl animate-pulse">🔐</span>
          </div>
        </div>

        {/* Text Section */}
        <h1 className="text-3xl font-black text-center text-white mb-3 italic tracking-tighter uppercase">
          Entry Pending
        </h1>
        <p className="text-center text-gray-500 text-sm mb-10 leading-relaxed px-4">
          We've notified the owner. Please stay on this screen while we verify your access.
        </p>

        {/* Status Box */}
        <div className="bg-orange-500/5 border border-orange-500/20 rounded-3xl px-6 py-5 mb-8 backdrop-blur-sm">
          <p className="text-center text-orange-500 font-bold text-xs flex items-center justify-center gap-3 uppercase tracking-widest">
            <span className="w-2 h-2 bg-orange-500 rounded-full animate-ping"></span>
            {message}
          </p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
            <p className="text-[9px] text-gray-500 uppercase font-black mb-1 tracking-widest">Room</p>
            <p className="text-sm font-mono font-bold text-white truncate">{room}</p>
          </div>
          <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex items-center gap-3">
             <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-black text-xs uppercase">
                {name?.charAt(0)}
             </div>
             <div className="overflow-hidden">
                <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">User</p>
                <p className="text-[11px] font-bold text-white truncate uppercase">{name}</p>
             </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-10 pt-6 border-t border-white/5 text-center">
          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em]">
            Vibe Secure Connection • 2026
          </p>
        </div>
      </div>
    </div>
  );
}