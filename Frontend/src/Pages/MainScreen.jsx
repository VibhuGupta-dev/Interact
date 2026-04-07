import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { clearUser, setRoomcode } from "../Redux/Features/UserSlice";
import { Chat } from "../Components/Chat";
import { copyToClipboard } from "../Api/copytoclipboard";
import { PermissionScreen } from "../Components/Permission";
import { createSocket } from "../Api/ws";

export function MainScreen() {
  const { roomcode: urlRoomCode } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const role = useSelector((store) => store.User.role);
  const room = useSelector((store) => store.User.roomcode);
  const name = useSelector((store) => store.User.name);

  const [socket, setSocket] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [isChatSidebarOpen, setIsChatSidebarOpen] = useState(false); // Sidebar control
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

    socket.on("newjoinreq", (data) => {
      setRequests((prev) => [...prev, data]);
      setRequestsAnimation(true);
      setTimeout(() => setRequestsAnimation(false), 600);
    });

    socket.on("requestAccepted", () => {
      setShowChat(true);
    });

    socket.on("requestRejected", () => {
      dispatch(clearUser());
      navigate("/");
    });

    return () => {
      socket.off("connect");
      socket.off("newjoinreq");
      socket.off("requestAccepted");
      socket.off("requestRejected");
    };
  }, [socket, role, urlRoomCode, name, navigate, dispatch]);

  const handleAccept = (request) => {
    if (!request || !socket || processingId) return;
    setProcessingId(request.userId);
    socket.emit("acceptJoinRequest", {
      roomcode: room,
      userId: request.userId,
      name: request.name,
    });
    setTimeout(() => {
      setRequests((prev) => prev.filter((req) => req.userId !== request.userId));
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
      setRequests((prev) => prev.filter((req) => req.userId !== request.userId));
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
    <div className="min-h-screen bg-[#1a1a1a] text-[#e8e8e8] flex flex-col overflow-hidden">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-[#1a1a1a]/80 border-b border-white/8 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto py-4 px-6 flex items-center justify-between">
          <div className="text-orange-500 font-bold italic">VIBE ROOM</div>
          
          <div className="flex items-center gap-4">
            {/* Chat Toggle Button */}
            <button 
              onClick={() => setIsChatSidebarOpen(!isChatSidebarOpen)}
              className={`p-2.5 rounded-lg transition-all border ${isChatSidebarOpen ? 'bg-orange-500 border-orange-400' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </button>

            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/8">
              <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center font-bold text-white uppercase">{name?.charAt(0)}</div>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold">{name}</p>
                <p className="text-[10px] text-gray-500 uppercase">{role}</p>
              </div>
            </div>

            {role === "Owner" && (
              <button onClick={() => setShowRequests(!showRequests)} className="relative p-2.5 rounded-lg hover:bg-white/5 transition-all">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={requestsAnimation ? 'animate-bounce text-orange-400' : 'text-[#999]'}>
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {requests.length > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-600 rounded-full text-[10px] flex items-center justify-center border-2 border-[#1a1a1a]">{requests.length}</span>}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Container with Sidebar Layout */}
      <div className="flex flex-1 relative overflow-hidden">
        
        {/* Left Side: Video/Main Content Area */}
        <div className={`flex-1 transition-all duration-300 p-8 ${isChatSidebarOpen ? 'mr-0' : ''}`}>
           <div className="w-full h-full rounded-3xl bg-white/5 border border-white/5 flex items-center justify-center border-dashed">
              <p className="text-gray-500 italic">Main Content Area (Video or Stream)</p>
           </div>
        </div>

        {/* Right Side: Chat Sidebar */}
        <div className={`transition-all duration-300 border-l border-white/10 bg-[#1e1e1e] ${isChatSidebarOpen ? 'w-[350px] translate-x-0' : 'w-0 translate-x-full'}`}>
          {isChatSidebarOpen && (
            <Chat socket={socket} name={name} room={room} role={role} />
          )}
        </div>
      </div>

      {/* Requests Modal (Owner Only) */}
      {role === "Owner" && showRequests && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-md" onClick={() => setShowRequests(false)}>
          <div onClick={(e) => e.stopPropagation()} className="absolute top-24 right-8 w-full max-w-md bg-[#242424] rounded-2xl shadow-2xl border border-white/8 overflow-hidden">
            {/* ... requests logic remains same ... */}
            <div className="bg-[#1a1a1a] border-b border-white/8 px-6 py-4 flex justify-between items-center">
               <h2 className="text-sm font-bold uppercase text-orange-500">Join Requests</h2>
               <button onClick={() => setShowRequests(false)}>✕</button>
            </div>
            <div className="max-h-[400px] overflow-y-auto p-4 space-y-3">
               {requests.length === 0 ? <p className="text-center py-10 text-gray-500 text-xs italic">No requests</p> : 
                requests.map(req => (
                  <div key={req.userId} className="p-4 bg-white/5 rounded-xl flex items-center justify-between">
                    <p className="text-sm font-medium">{req.name}</p>
                    <div className="flex gap-2">
                      <button onClick={() => handleAccept(req)} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs">Accept</button>
                      <button onClick={() => handleReject(req)} className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs">Reject</button>
                    </div>
                  </div>
                ))
               }
            </div>
          </div>
        </div>
      )}

      {/* Footer (Copy Room Code) */}
      <footer className="fixed bottom-4 left-4 z-50"> 
        {role === "Owner" && copycomponent && (
          <div className="flex items-center gap-3 bg-[#242424] rounded-2xl p-4 border border-orange-500/30 shadow-2xl">
            <input className="px-4 py-2 bg-black/20 text-white rounded-md text-xs font-mono w-48 border border-white/5" type="text" value={room} readOnly />
            <button onClick={handlecopybutton} className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-md transition-all">
              {copy ? "Copied!" : "Copy"}
            </button>
          </div>
        )}
      </footer>
    </div>
  );
}