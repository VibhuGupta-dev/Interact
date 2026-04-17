import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { clearUser, setJoined, setRoomcode, setUsers } from "../Redux/Features/UserSlice";
import { Chat } from "../Components/Chat";
import { copyToClipboard } from "../Api/copytoclipboard";
import { PermissionScreen } from "../Components/Permission";
import { createSocket } from "../Api/ws";
import { destroySocket } from "../Api/ws";
import { UserInfo } from "../Components/userInfo";
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
  const [isChatSidebarOpen, setIsChatSidebarOpen] = useState(false);
  const [requests, setRequests] = useState([]);
  const [processingId, setProcessingId] = useState(null);
  const [copycomponent, setCopycomponent] = useState(false);
  const [copy, setCopy] = useState(false);
  const [showRequests, setShowRequests] = useState(false);
  const [requestsAnimation, setRequestsAnimation] = useState(false);

  useEffect(() => {
    if (!name) {
      navigate("/");
      return;
    }
    const newSocket = createSocket();
    setSocket(newSocket);
    dispatch(setRoomcode(urlRoomCode));
    return () => {
      newSocket.disconnect();
    };
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

    socket.on("users-update", (updatedUsers) => {
      dispatch(setUsers(updatedUsers));
    });

    socket.on("newjoinreq", (data) => {
      setRequests((prev) => [...prev, data]);
      setRequestsAnimation(true);
      setTimeout(() => setRequestsAnimation(false), 600);
    });

    socket.on("requestAccepted", () => {
      setShowChat(true);
      dispatch(setJoined(true));
    });

    socket.on("requestRejected", () => {
      dispatch(clearUser());
      navigate("/");
    });

    socket.on("userLeft", (data) => {
      console.log(`${data.name} left the room`);
    });

    return () => {
      socket.off("connect");
      socket.off("users-update");
      socket.off("newjoinreq");
      socket.off("requestAccepted");
      socket.off("requestRejected");
      socket.off("userLeft");
      destroySocket();
    };
  }, [socket, role, urlRoomCode, name, navigate, dispatch]);

  const handleAccept = (request) => {
    if (!request || !socket || processingId) return;
    setProcessingId(request.userId);
    socket.emit("acceptJoinRequest", {
      roomcode: room,
      userId: request.userId,
      name: request.name,
      role: request.role,
    });
    setTimeout(() => {
      setRequests((prev) => prev.filter((req) => req.userId !== request.userId));
      setProcessingId(null);
    }, 500);
  };

  const handleReject = (request) => {
    if (!request || !socket || processingId) return;
    setProcessingId(request.userId);
    socket.emit("rejectJoinRequest", { roomcode: room, userId: request.userId });
    setTimeout(() => {
      setRequests((prev) => prev.filter((req) => req.userId !== request.userId));
      setProcessingId(null);
    }, 500);
  };

  const handlecopybutton = () => {
    copyToClipboard(room);
    setCopy(true);
    setTimeout(() => setCopy(false), 2000);
  };

  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setCopycomponent(true);
    const timer = setTimeout(() => setCopycomponent(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  if (role === "user" && !showChat) {
    return <PermissionScreen name={name} room={room} />;
  }

  return (
    <div className="h-screen bg-[#1a1a1a] text-[#e8e8e8] flex flex-col overflow-hidden">
      {/* ── Navbar ── */}
      <nav className="flex-shrink-0 sticky top-0 z-50 bg-[#1a1a1a]/80 border-b border-white/8 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto py-4 px-6 flex items-center justify-evenly">
          <footer className="fixed bottom-4 left-4 top-25 z-50">
            {role === "Owner" && copycomponent && (
              <div className="flex items-center gap-3 bg-[#242424] rounded-2xl p-2 border border-orange-500/30 shadow-2xl">
                <input
                  className="px-2 py-2 bg-black/20 text-white rounded-md text-xs font-mono w-48 border border-white/5"
                  type="text"
                  value={room}
                  readOnly
                />
                <button
                  onClick={handlecopybutton}
                  className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-md"
                >
                  {copy ? "Copied!" : "Copy"}
                </button>
              </div>
            )}
          </footer>

          <div className="text-orange-500 font-bold italic">VIBE ROOM</div>
          <div className="text-lg font-semibold">
            Room: <span className="text-green-400">{room}</span>
          </div>
          <div className="text-md text-gray-300">{time}</div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsChatSidebarOpen(!isChatSidebarOpen)}
              className={`p-2.5 rounded-lg transition-all border ${
                isChatSidebarOpen
                  ? "bg-orange-500 border-orange-400"
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </button>

            <div className="relative group">
              <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-400 cursor-pointer hover:bg-white/10">
                👥 {users.length} online
              </div>
              <div className="absolute top-10 right-0 w-48 bg-[#242424] border border-white/10 rounded-xl shadow-xl p-2 hidden group-hover:block z-50">
                {users.map((u, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5">
                    <div className="w-6 h-6 rounded-md bg-orange-500 flex items-center justify-center text-[10px] font-bold">
                      {u.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-medium">{u.name}</p>
                      <p className="text-[10px] text-gray-500">{u.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/8">
              <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center font-bold text-white">
                {name?.charAt(0)}
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold">{name}</p>
                <p className="text-[10px] text-gray-500 uppercase">{role}</p>
              </div>
            </div>

            {role === "Owner" && (
              <button
                onClick={() => setShowRequests(!showRequests)}
                className="relative p-2.5 rounded-lg hover:bg-white/5 transition-all"
              >
                <svg
                  width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  className={requestsAnimation ? "animate-bounce text-orange-400" : "text-[#999]"}
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {requests.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-600 rounded-full text-[10px] flex items-center justify-center border-2 border-[#1a1a1a]">
                    {requests.length}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ── Body ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── Left: video + userinfo ── */}
        <div className="flex-1 min-w-0 flex flex-col p-6 gap-4 overflow-hidden min-h-0">

          {/* Video area — flex-1 with min-h-0 so it shares space correctly */}
          <div className="flex-1 min-h-0 rounded-3xl bg-white/5 border border-white/5 border-dashed overflow-hidden">
            {socket && <VideoStream socket={socket} />}
          </div>

         
        </div>

        {/* ── Right: chat sidebar ── */}
        <div
          className={`transition-all duration-300 border-l border-white/10 bg-[#1e1e1e] flex flex-col ${
            isChatSidebarOpen ? "w-[350px]" : "w-0 overflow-hidden"
          }`}
        >
          {isChatSidebarOpen && (
            <div className="flex-1 min-h-0">
              <Chat socket={socket} name={name} room={room} role={role} />
            </div>
          )}
        </div>
      </div>

      {/* ── Join Requests Modal ── */}
      {role === "Owner" && showRequests && (
        <div className="fixed inset-0 z-[60] bg-black/40" onClick={() => setShowRequests(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute top-20 right-6 w-full max-w-sm bg-[#1c1c1c] border border-white/[0.06] rounded-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
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
                className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/10 border border-white/[0.06] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="max-h-[360px] overflow-y-auto p-3 space-y-2">
              {requests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <p className="text-xs text-gray-600">No pending requests</p>
                </div>
              ) : (
                requests.map((req) => (
                  <div
                    key={req.userId}
                    className="flex items-center justify-between px-4 py-3 bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.05] rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/20 flex items-center justify-center text-amber-400 text-xs font-medium">
                        {req.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <span className="text-sm text-white">{req.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAccept(req)}
                        className="flex items-center gap-1.5 bg-white/[0.06] hover:bg-green-500/20 border border-white/[0.08] hover:border-green-500/30 text-gray-300 hover:text-green-400 px-3 py-1.5 rounded-lg text-xs transition-all"
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                        Accept
                      </button>
                      <button
                        onClick={() => handleReject(req)}
                        className="flex items-center gap-1.5 bg-white/[0.06] hover:bg-red-500/20 border border-white/[0.08] hover:border-red-500/30 text-gray-300 hover:text-red-400 px-3 py-1.5 rounded-lg text-xs transition-all"
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                        Reject
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