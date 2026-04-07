import { useEffect, useState, useRef, useImperativeHandle, forwardRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setRoomcode, clearUser } from "../Redux/Features/UserSlice";
import { createSocket } from "../Api/ws";

export const Chat = forwardRef(function Chat({ onNewJoinRequest, onUserJoined, onUserLeft }, ref) {
  const [message, setMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [isJoined, setIsJoined] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const { roomcode } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const scrollRef = useRef(null);

  // Mock messages for UI display
  const [messages, setMessages] = useState([
    { id: 1, user: "John", text: "Hey, how's everyone doing?", isSelf: false, time: "10:00 AM" },
    { id: 2, user: "Sarah", text: "All good! Just finished the project", isSelf: false, time: "10:01 AM" },
    { id: 3, user: "You", text: "That's awesome! Let's ship it 🚀", isSelf: true, time: "10:02 AM" },
  ]);

  const handleSend = () => {
    if (newMessage.trim()) {
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages([...messages, { id: Date.now(), user: "You", text: newMessage, isSelf: true, time }]);
      setNewMessage("");
    }
  };

  // Auto scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useImperativeHandle(ref, () => ({
    socket: socketRef.current
  }), [socket]);

  const room = useSelector((store) => store.User.roomcode);
  const name = useSelector((store) => store.User.name);
  const role = useSelector((store) => store.User.role);

  useEffect(() => {
    if (!name || name === "") {
      dispatch(clearUser());
      navigate("/");
      return;
    }

    const newSocket = createSocket();
    socketRef.current = newSocket;
    setSocket(newSocket);

    const handleDisconnect = (reason) => {
      if (reason !== "io server disconnect") {
        dispatch(clearUser());
        navigate("/");
      } else {
        setTimeout(() => newSocket.connect(), 1000);
      }
    };

    newSocket.on("disconnect", handleDisconnect);
    newSocket.on("connect_error", () => setMessage("Connection error."));

    return () => {
      newSocket.off("disconnect", handleDisconnect);
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [name, dispatch, navigate]);

  useEffect(() => {
    dispatch(setRoomcode(roomcode));
  }, [roomcode, dispatch]);

  useEffect(() => {
    if (!socket || !name || !room || isJoined) return;
    if (role === "Owner") {
      socket.emit("owner-join", { roomcode: room, name, role, ownerid: socket.id });
      setIsJoined(true);
    }
  }, [socket, name, role, room, isJoined]);

  useEffect(() => {
    if (!socket) return;
    socket.on("newjoinreq", (data) => onNewJoinRequest?.(data));
    socket.on("userJoined", (data) => {
      setMessage(`👋 ${data.name} joined`);
      setTimeout(() => setMessage(""), 3000);
      onUserJoined?.(data);
    });
    socket.on("userLeft", (data) => {
      setMessage(`🚶 ${data.name} left`);
      setTimeout(() => setMessage(""), 3000);
      onUserLeft?.(data);
    });
    return () => {
      socket.off("newjoinreq");
      socket.off("userJoined");
      socket.off("userLeft");
    };
  }, [socket, onNewJoinRequest, onUserJoined, onUserLeft]);

  if (!socket) return <div className="h-full flex items-center justify-center text-gray-500 animate-pulse">Connecting...</div>;

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e]">
      {/* Status Banner */}
      {message && (
        <div className="absolute top-14 left-0 right-0 z-10 flex justify-center">
          <div className="bg-orange-500/20 border border-orange-500/30 backdrop-blur-md px-4 py-1 rounded-full shadow-lg">
            <p className="text-orange-400 text-[11px] font-medium">{message}</p>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.isSelf ? 'items-end' : 'items-start'}`}>
            <div className="flex items-end gap-2 max-w-[85%]">
              {!msg.isSelf && (
                <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-orange-400">
                  {msg.user.charAt(0)}
                </div>
              )}
              <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                msg.isSelf 
                ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-br-none' 
                : 'bg-[#2d2d2d] text-gray-200 border border-white/5 rounded-bl-none'
              }`}>
                {msg.text}
              </div>
            </div>
            <span className="text-[10px] text-gray-600 mt-1 px-1">{msg.time}</span>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* Input Field */}
      <div className="p-4 bg-[#1e1e1e] border-t border-white/5">
        <div className="flex items-center gap-2 bg-[#2d2d2d] rounded-2xl p-1.5 border border-white/5 focus-within:border-orange-500/50 transition-all">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-3 text-white placeholder-gray-500"
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="w-10 h-10 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:hover:bg-orange-500 text-white rounded-xl flex items-center justify-center transition-all shadow-lg shadow-orange-500/20"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
});