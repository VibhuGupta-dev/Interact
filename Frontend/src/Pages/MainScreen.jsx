import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { clearUser, setJoined, setRoomcode, setUsers } from "../Redux/Features/UserSlice";
import { Chat } from "../Components/Chat";
import { copyToClipboard } from "../Api/copytoclipboard";
import { PermissionScreen } from "../Components/Permission";
import { createSocket } from "../Api/ws";
import { destroySocket } from "../Api/ws";
import { VideoStream } from "../Components/VideoStreams";

export function MainScreen() {
  const { roomcode: urlRoomCode } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const role = useSelector((store) => store.User.role);
  const room = useSelector((store) => store.User.roomcode);
  const name = useSelector((store) => store.User.name);
  const users = useSelector((store) => store.User.users);

  const [socket, setSocket] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [requests, setRequests] = useState([]);
  const [processingId, setProcessingId] = useState(null);
  const [copycomponent, setCopycomponent] = useState(false);
  const [copy, setCopy] = useState(false);
  const [showRequests, setShowRequests] = useState(false);
  const [requestsAnimation, setRequestsAnimation] = useState(false);
  const [time, setTime] = useState("");

  useEffect(() => {
    if (!name) { navigate("/"); return; }
    const newSocket = createSocket();
    setSocket(newSocket);
    dispatch(setRoomcode(urlRoomCode));
    return () => { newSocket.disconnect(); };
  }, [name, urlRoomCode, dispatch, navigate]);

  useEffect(() => {
    if (!socket) return;
    socket.on("connect", () => {
      if (role === "Owner") {
        socket.emit("owner-join", { roomcode: urlRoomCode, name, role });
        setShowChat(true);
        dispatch(setJoined(true));
      } else {
        socket.emit("user-join-request", { roomcode: urlRoomCode, name, role });
      }
    });
    socket.on("users-update", (updatedUsers) => dispatch(setUsers(updatedUsers)));
    socket.on("newjoinreq", (data) => {
      setRequests((prev) => [...prev, data]);
      setRequestsAnimation(true);
      setTimeout(() => setRequestsAnimation(false), 600);
    });
    socket.on("requestAccepted", () => { setShowChat(true); dispatch(setJoined(true)); });
    socket.on("requestRejected", () => { dispatch(clearUser()); navigate("/"); });
    socket.on("userLeft", (data) => console.log(`${data.name} left`));
    return () => {
      socket.off("connect"); socket.off("users-update"); socket.off("newjoinreq");
      socket.off("requestAccepted"); socket.off("requestRejected"); socket.off("userLeft");
      destroySocket();
    };
  }, [socket, role, urlRoomCode, name, navigate, dispatch]);

  const handleAccept = (req) => {
    if (!req || !socket || processingId) return;
    setProcessingId(req.userId);
    socket.emit("acceptJoinRequest", { roomcode: room, userId: req.userId, name: req.name, role: req.role });
    setTimeout(() => { setRequests((p) => p.filter((r) => r.userId !== req.userId)); setProcessingId(null); }, 500);
  };

  const handleReject = (req) => {
    if (!req || !socket || processingId) return;
    setProcessingId(req.userId);
    socket.emit("rejectJoinRequest", { roomcode: room, userId: req.userId });
    setTimeout(() => { setRequests((p) => p.filter((r) => r.userId !== req.userId)); setProcessingId(null); }, 500);
  };

  const handlecopybutton = () => {
    copyToClipboard(room); setCopy(true); setTimeout(() => setCopy(false), 2000);
  };

  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    setCopycomponent(true);
    const t = setTimeout(() => setCopycomponent(false), 10000);
    return () => clearTimeout(t);
  }, []);

  if (role === "user" && !showChat) {
    return <PermissionScreen name={name} room={room} />;
  }

  return (
    <div className="h-[100dvh] bg-[#111] text-[#e8e8e8] flex flex-col overflow-hidden">

      {/* ── Top Navbar ── */}
      <nav className="flex-shrink-0 z-50 bg-[#1a1a1a]/90 border-b border-white/[0.06] backdrop-blur-xl px-3 sm:px-5 py-2.5 flex items-center justify-between gap-2">

        {/* Left — logo + room */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
              <circle cx="6" cy="9" r="2.5" fill="white" />
              <circle cx="13" cy="5" r="1.8" fill="white" opacity="0.7" />
              <circle cx="13" cy="13" r="1.8" fill="white" opacity="0.7" />
              <line x1="8.4" y1="9" x2="11.3" y2="6" stroke="white" strokeWidth="1.2" opacity="0.6" />
              <line x1="8.4" y1="9" x2="11.3" y2="12" stroke="white" strokeWidth="1.2" opacity="0.6" />
            </svg>
          </div>
          <div className="min-w-0 hidden sm:block">
            <p className="text-[11px] text-gray-500 leading-none">Room</p>
            <p className="text-sm font-semibold text-green-400 truncate">{room}</p>
          </div>
          <span className="text-sm font-semibold text-green-400 sm:hidden truncate max-w-[80px]">{room}</span>
        </div>

        {/* Centre — time (hidden on xs) */}
        <span className="text-sm text-gray-400 hidden sm:block flex-shrink-0">{time}</span>

        {/* Right — actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">

          {/* Copy room code */}
          {role === "Owner" && copycomponent && (
            <button
              onClick={handlecopybutton}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-medium hover:bg-orange-500/20 transition-all"
            >
              {copy ? "✓ Copied" : "Copy code"}
            </button>
          )}

          {/* Users count */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-400 hover:bg-white/10 transition-all">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <span>{users.length}</span>
            </button>
            {/* Hover dropdown */}
            <div className="absolute top-10 right-0 w-44 bg-[#242424] border border-white/10 rounded-xl shadow-xl p-2 hidden group-hover:block z-50">
              {users.map((u, i) => (
                <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5">
                  <div className="w-5 h-5 rounded-md bg-orange-500 flex items-center justify-center text-[9px] font-bold flex-shrink-0">
                    {u.name?.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{u.name}</p>
                    <p className="text-[9px] text-gray-500">{u.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat toggle */}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`p-2 rounded-lg border transition-all ${
              isChatOpen ? "bg-orange-500 border-orange-400 text-white" : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </button>

          {/* Join requests bell */}
          {role === "Owner" && (
            <button
              onClick={() => setShowRequests(!showRequests)}
              className="relative p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
            >
              <svg
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className={requestsAnimation ? "animate-bounce text-orange-400" : "text-gray-400"}
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {requests.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full text-[9px] flex items-center justify-center border border-[#1a1a1a]">
                  {requests.length}
                </span>
              )}
            </button>
          )}

          {/* My avatar */}
          <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center font-bold text-white text-xs flex-shrink-0">
            {name?.charAt(0)}
          </div>
        </div>
      </nav>

      {/* ── Body ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">

        {/* ── Video area ── */}
        <div
          className={`flex-1 min-w-0 min-h-0 transition-all duration-300 ${
            isChatOpen ? "hidden sm:flex" : "flex"
          } flex-col`}
        >
          {/* Mobile copy banner */}
          {role === "Owner" && copycomponent && (
            <div className="sm:hidden flex items-center gap-2 mx-3 mt-2 px-3 py-2 bg-[#1e1e1e] border border-orange-500/20 rounded-xl">
              <span className="text-xs text-gray-400 font-mono flex-1 truncate">{room}</span>
              <button
                onClick={handlecopybutton}
                className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-lg flex-shrink-0"
              >
                {copy ? "✓" : "Copy"}
              </button>
            </div>
          )}

          <div className="flex-1 min-h-0 p-2 sm:p-3">
            <div className="w-full h-full rounded-2xl sm:rounded-3xl bg-white/[0.03] border border-white/[0.04] overflow-hidden">
              {socket && <VideoStream socket={socket} />}
            </div>
          </div>
        </div>

        {/* ── Chat sidebar — desktop: side panel, mobile: full overlay ── */}
        {isChatOpen && (
          <>
            {/* Mobile: full screen overlay */}
            <div className="sm:hidden absolute inset-0 z-40 bg-[#1a1a1a] flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                <span className="text-sm font-semibold">Chat</span>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              <div className="flex-1 min-h-0">
                <Chat socket={socket} name={name} room={room} role={role} />
              </div>
            </div>

            {/* Desktop: side panel */}
            <div className="hidden sm:flex w-[320px] lg:w-[360px] flex-shrink-0 flex-col border-l border-white/[0.06] bg-[#1a1a1a]">
              <Chat socket={socket} name={name} room={room} role={role} />
            </div>
          </>
        )}
      </div>

      {/* ── Join Requests Modal ── */}
      {role === "Owner" && showRequests && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-start justify-end p-3 sm:p-4 pt-16 sm:pt-20" onClick={() => setShowRequests(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-[#1c1c1c] border border-white/[0.06] rounded-2xl overflow-hidden shadow-2xl"
          >
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white">Join requests</span>
                {requests.length > 0 && (
                  <span className="bg-amber-500/15 text-amber-400 text-[10px] font-medium px-2 py-0.5 rounded-full">
                    {requests.length}
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowRequests(false)}
                className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/10 border border-white/[0.06] flex items-center justify-center text-gray-400"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div className="max-h-[50vh] overflow-y-auto p-2.5 space-y-2">
              {requests.length === 0 ? (
                <div className="py-10 text-center text-xs text-gray-600">No pending requests</div>
              ) : (
                requests.map((req) => (
                  <div key={req.userId} className="flex items-center justify-between px-3 py-2.5 bg-white/[0.03] border border-white/[0.05] rounded-xl">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/20 flex items-center justify-center text-amber-400 text-xs font-medium flex-shrink-0">
                        {req.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <span className="text-sm text-white truncate">{req.name}</span>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleAccept(req)}
                        className="p-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 transition-all"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <path d="M20 6L9 17l-5-5"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => handleReject(req)}
                        className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}