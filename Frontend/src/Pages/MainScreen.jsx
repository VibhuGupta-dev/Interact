import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { clearUser, setRoomcode, setUsers } from "../Redux/Features/UserSlice";
import { Chat } from "../Components/Chat";
import { copyToClipboard } from "../Api/copytoclipboard";
import { PermissionScreen } from "../Components/Permission";
import { createSocket } from "../Api/ws";
import { UserInfo } from "../Components/userInfo";

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
      } else {
        socket.emit("user-join-request", { roomcode: urlRoomCode, name, role });
      }
    });

    socket.on("users-update", (updatedUsers) => {
      dispatch(setUsers(updatedUsers));
      console.log("Users updated:", updatedUsers);
    });

    socket.on("newjoinreq", (data) => {
      setRequests((prev) => [...prev, data]);
      setRequestsAnimation(true);
      setTimeout(() => setRequestsAnimation(false), 600);
    });

    socket.on("requestAccepted", () => {
      setShowChat(true);
      // users-update server se automatically aayega
    });

    socket.on("requestRejected", () => {
      dispatch(clearUser());
      navigate("/");
    });

    socket.on("userLeft", (data) => {
      console.log(`${data.name} left the room`);
      // users-update server se automatically aayega
    });

    return () => {
      socket.off("connect");
      socket.off("users-update");
      socket.off("newjoinreq");
      socket.off("requestAccepted");
      socket.off("requestRejected");
      socket.off("userLeft");
    };
  }, [socket, role, urlRoomCode, name, navigate, dispatch]);

  const handleAccept = (request) => {
    if (!request || !socket || processingId) return;
    setProcessingId(request.userId);
    socket.emit("acceptJoinRequest", {
      roomcode: room,
      userId: request.userId,
      name: request.name,
      role: request.role, // ✅ role bhi bhejo
    });
    setTimeout(() => {
      setRequests((prev) =>
        prev.filter((req) => req.userId !== request.userId),
      );
      setProcessingId(null);
    }, 500);
  };

  const handleReject = (request) => {
    if (!request || !socket || processingId) return;
    setProcessingId(request.userId);
    socket.emit("rejectJoinRequest", {
      roomcode: room,
      userId: request.userId,
    });
    setTimeout(() => {
      setRequests((prev) =>
        prev.filter((req) => req.userId !== request.userId),
      );
      setProcessingId(null);
    }, 500);
  };

  const handlecopybutton = () => {
    copyToClipboard(room);
    setCopy(true);
    setTimeout(() => setCopy(false), 2000);
  };

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
      {/* Navbar */}
      <nav className="flex-shrink-0 sticky top-0 z-50 bg-[#1a1a1a]/80 border-b border-white/8 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto py-4 px-6 flex items-center justify-between">
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

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsChatSidebarOpen(!isChatSidebarOpen)}
              className={`p-2.5 rounded-lg transition-all border ${
                isChatSidebarOpen
                  ? "bg-orange-500 border-orange-400"
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </button>

            {/* Users */}
            <div className="relative group">
              <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-400 cursor-pointer hover:bg-white/10">
                👥 {users.length} online
              </div>

              <div className="absolute top-10 right-0 w-48 bg-[#242424] border border-white/10 rounded-xl shadow-xl p-2 hidden group-hover:block z-50">
                {users.map((u, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5"
                  >
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

            {/* Profile */}
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/8">
              <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center font-bold text-white">
                {name?.charAt(0)}
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold">{name}</p>
                <p className="text-[10px] text-gray-500 uppercase">{role}</p>
              </div>
            </div>

            {/* Requests button (UNCHANGED) */}
            {role === "Owner" && (
              <button
                onClick={() => setShowRequests(!showRequests)}
                className="relative p-2.5 rounded-lg hover:bg-white/5 transition-all"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={
                    requestsAnimation
                      ? "animate-bounce text-orange-400"
                      : "text-[#999]"
                  }
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

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT SIDE */}
        <div className="flex-1 flex flex-col p-6 gap-4 overflow-hidden">
          {/* Video */}
          <div className="flex-1 rounded-3xl bg-white/5 border border-white/5 border-dashed flex items-center justify-center">
            <p className="text-gray-500 italic">
              Main Content Area (Video or Stream)
            </p>
          </div>

          {/* ✅ UserInfo FIXED POSITION */}
          <div className="h-[180px] overflow-y-auto rounded-2xl bg-white/5 border border-white/5 p-2">
            <UserInfo />
          </div>
        </div>

        {/* Chat Sidebar */}
        <div
          className={`transition-all duration-300 border-l border-white/10 bg-[#1e1e1e]
        ${isChatSidebarOpen ? "w-[350px]" : "w-0 overflow-hidden"}
        flex flex-col`}
        >
          {isChatSidebarOpen && (
            <div className="flex-1 min-h-0">
              <Chat socket={socket} name={name} room={room} role={role} />
            </div>
          )}
        </div>
      </div>

      {/* Requests Modal (100% UNCHANGED) */}
      {role === "Owner" && showRequests && (
        <div
          className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-md"
          onClick={() => setShowRequests(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute top-24 right-8 w-full max-w-md bg-[#242424] rounded-2xl shadow-2xl border border-white/8 overflow-hidden"
          >
            <div className="bg-[#1a1a1a] border-b border-white/8 px-6 py-4 flex justify-between items-center">
              <h2 className="text-sm font-bold uppercase text-orange-500">
                Join Requests
              </h2>
              <button onClick={() => setShowRequests(false)}>✕</button>
            </div>
            <div className="max-h-[400px] overflow-y-auto p-4 space-y-3">
              {requests.length === 0 ? (
                <p className="text-center py-10 text-gray-500 text-xs italic">
                  No requests
                </p>
              ) : (
                requests.map((req) => (
                  <div
                    key={req.userId}
                    className="p-4 bg-white/5 rounded-xl flex items-center justify-between"
                  >
                    <p className="text-sm font-medium">{req.name}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAccept(req)}
                        className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleReject(req)}
                        className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs"
                      >
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

      {/* Footer */}
    </div>
  );
}
