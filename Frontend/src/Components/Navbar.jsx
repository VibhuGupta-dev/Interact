import { useEffect, useRef, useState } from "react";
import LoginModal from "./Loginmodal";
import { useNavigate } from "react-router-dom";
import api from "../Api/axios";
import { useDispatch , useSelector } from "react-redux";
import { setName } from "../Redux/Features/UserSlice";


export default function Navbar() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch()


  useEffect(() => {
    const getUser = async () => {
      try {
        const { data } = await api.get("/auth/api/me");
        console.log(data.name)
        dispatch(setName(data.name))
        setUser(data);
      } catch {
        setUser(null);
      }
    };
    getUser();
  }, [loginOpen]);

  const name = useSelector((store) => store.User.name)
  // close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await api.post("/auth/api/logout");
    setUser(null);
    setDropdownOpen(false);
    navigate("/");
  };

  // initials fallback if no Google image
  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-10 py-4 bg-[#1a1a1a]/95 backdrop-blur-sm border-b border-white/8">

        {/* Logo */}
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
        {user ? (
          // ── Logged in — show avatar with dropdown ──────────────────────
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-xl hover:bg-white/5 transition-all duration-150 group"
            >
              {/* Avatar */}
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-orange-500/40 transition-all"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white/10 group-hover:ring-orange-500/40 transition-all">
                  {initials}
                </div>
              )}
              <span className="text-[#d4d4d4] text-sm font-medium">{name?.split(" ")[0]}</span>
              {/* Chevron */}
              <svg
                width="12" height="12" viewBox="0 0 12 12" fill="none"
                className={`text-[#555] transition-transform duration-150 ${dropdownOpen ? "rotate-180" : ""}`}
              >
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-[#212121] border border-white/10 rounded-xl shadow-xl overflow-hidden">
                {/* User info */}
                <div className="px-4 py-3 border-b border-white/8">
                  <p className="text-[#e5e5e5] text-sm font-medium truncate">{user.name}</p>
                  <p className="text-[#555] text-xs truncate mt-0.5">{user.email}</p>
                </div>
                {/* Links */}
                <div className="p-1">
                  <button
                    onClick={() => { navigate("/profile"); setDropdownOpen(false); }}
                    className="w-full text-left px-3 py-2 rounded-lg text-[#999] text-sm hover:bg-white/5 hover:text-[#e5e5e5] transition-all duration-150"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => { navigate("/settings"); setDropdownOpen(false); }}
                    className="w-full text-left px-3 py-2 rounded-lg text-[#999] text-sm hover:bg-white/5 hover:text-[#e5e5e5] transition-all duration-150"
                  >
                    Settings
                  </button>
                  <div className="h-px bg-white/8 my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded-lg text-red-400 text-sm hover:bg-red-500/10 transition-all duration-150"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          // ── Logged out — show login / signup ───────────────────────────
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLoginOpen(true)}
              className="px-4 py-2 text-sm text-[#999] font-medium hover:text-[#e5e5e5] transition-colors duration-150"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="px-5 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-400 transition-colors duration-150 shadow-md shadow-orange-500/15"
            >
              Sign up free
            </button>
          </div>
        )}

      </nav>

      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}