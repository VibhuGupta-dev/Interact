import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../Api/axios";

export default function LoginModal({ isOpen, onClose }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    setError("");
    const { email, password } = form;

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/auth/api/login", { email, password }); 
      onClose(); 
      navigate("/"); 
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.open("http://localhost:5000/auth/google", "_self");
  };

  // ✅ close on Escape key
  const handleKeyDown = (e) => {
    if (e.key === "Escape") onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none"
        onKeyDown={handleKeyDown}
      >
        <div className="w-full max-w-sm bg-[#212121] border border-white/10 rounded-2xl p-8 flex flex-col gap-6 shadow-2xl pointer-events-auto">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center">
                <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
                  <circle cx="6" cy="9" r="2.5" fill="white" />
                  <circle cx="13" cy="5" r="1.8" fill="white" opacity="0.7" />
                  <circle cx="13" cy="13" r="1.8" fill="white" opacity="0.7" />
                  <line x1="8.4" y1="9" x2="11.3" y2="6" stroke="white" strokeWidth="1.2" opacity="0.6" />
                  <line x1="8.4" y1="9" x2="11.3" y2="12" stroke="white" strokeWidth="1.2" opacity="0.6" />
                </svg>
              </div>
              <span className="text-[#e5e5e5] font-semibold text-sm tracking-widest">INTRACT</span>
            </div>

            {/* ✅ Close button calls onClose */}
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[#555] hover:text-[#999] hover:bg-white/5 transition-all duration-150"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Title */}
          <div>
            <h2 className="text-[#e5e5e5] text-xl font-semibold tracking-tight">Welcome back</h2>
            <p className="text-[#666] text-sm mt-1">Log in to your account</p>
          </div>

          {/* Google */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl bg-[#2a2a2a] border border-white/10 text-[#d4d4d4] text-sm font-medium hover:bg-[#303030] hover:border-white/20 active:scale-95 transition-all duration-150"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
              <path d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05" />
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-[#444] text-xs">or</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          {/* Error */}
          {error && (
            <div className="px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              {error}
            </div>
          )}

          {/* Fields */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[#999] text-xs font-medium">Email address</label>
              <input
                name="email"
                type="email"
                placeholder="john@example.com"
                value={form.email}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl bg-[#2a2a2a] border border-white/8 text-[#d4d4d4] text-sm placeholder-[#444] outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all duration-150"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[#999] text-xs font-medium">Password</label>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl bg-[#2a2a2a] border border-white/8 text-[#d4d4d4] text-sm placeholder-[#444] outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all duration-150"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-400 active:scale-95 transition-all duration-150 shadow-md shadow-orange-500/15 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>

          <p className="text-[#555] text-sm text-center">
            Don't have an account?{" "}
            <a href="/signup" className="text-orange-400 hover:text-orange-300 font-medium transition-colors">Sign up free</a>
          </p>

        </div>
      </div>
    </>
  );
}