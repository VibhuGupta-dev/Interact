import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearUser } from "../Redux/Features/UserSlice";

export function PermissionScreen({ name, room, socket }) {
  const [message, setMessage] = useState("Waiting for owner approval...");
  const [timer, setTimer] = useState(120);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (timer === 0) { navigate("/"); return; }
    const t = setTimeout(() => setTimer((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  useEffect(() => {
    if (!socket) return;
    const handleAccepted = () => setMessage("Request accepted! Redirecting...");
    const handleRejected = (data) => {
      setMessage(data.message || "Request rejected.");
      setTimeout(() => { dispatch(clearUser()); navigate("/"); }, 2000);
    };
    socket.on("requestAccepted", handleAccepted);
    socket.on("requestRejected", handleRejected);
    return () => {
      socket.off("requestAccepted", handleAccepted);
      socket.off("requestRejected", handleRejected);
    };
  }, [socket, dispatch, navigate]);

  const pct = (timer / 120) * 100;
  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="flex items-center justify-center h-screen bg-[#111111]">
      <div className="bg-[#1c1c1c] border border-white/[0.06] rounded-3xl p-8 max-w-sm w-full mx-4">

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-lg font-medium text-center text-white mb-1">Entry pending</h1>
        <p className="text-sm text-gray-500 text-center leading-relaxed mb-6">
          Waiting for the owner to approve your request. Please stay on this screen.
        </p>

        {/* Status pill */}
        <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.07] rounded-full px-4 py-2.5 mb-6">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
          <span className="text-xs text-gray-400">{message}</span>
        </div>

        {/* Timer bar */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs text-gray-600">Time left</span>
          <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${pct}%`,
                background: pct < 25 ? "#ef4444" : "#f59e0b",
              }}
            />
          </div>
          <span className="text-xs font-medium text-white tabular-nums">{fmt(timer)}</span>
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-3">
            <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-1">Room</p>
            <p className="text-sm font-mono text-white truncate">{room}</p>
          </div>
          <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-3 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
              {name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-0.5">User</p>
              <p className="text-xs text-white truncate">{name}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/[0.05] pt-4 text-center">
          <p className="text-[10px] text-gray-700 uppercase tracking-widest">Vibe secure connection • 2026</p>
        </div>

      </div>
    </div>
  );
}