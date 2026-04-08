import {
  useEffect,
  useState,
  useRef,
  useImperativeHandle,
  forwardRef,
  useLayoutEffect,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearUser } from "../Redux/Features/UserSlice";
import { getSocket } from "../Api/ws";

export const Chat = forwardRef(function Chat(
  { onNewJoinRequest, onUserJoined, onUserLeft },
  ref
) {
  const [statusMessage, setStatusMessage] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const socketRef = useRef(null);
  const containerRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const room = useSelector((store) => store.User.roomcode);
  const name = useSelector((store) => store.User.name);
  const role = useSelector((store) => store.User.role);

  // expose socket
  useImperativeHandle(ref, () => ({
    socket: socketRef.current,
  }));

  // ✅ AUTO SCROLL FIX (reliable)
  useLayoutEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop =
        containerRef.current.scrollHeight;
    }
  }, [messages]);

  // auth + socket init
  useEffect(() => {
    if (!name) {
      dispatch(clearUser());
      navigate("/");
      return;
    }

    const socket = getSocket();
    if (!socket) return;

    socketRef.current = socket;

    const handleDisconnect = (reason) => {
      if (reason !== "io server disconnect") {
        dispatch(clearUser());
        navigate("/");
      }
    };

    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("disconnect", handleDisconnect);
    };
  }, [name, dispatch, navigate]);

  // socket events
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewJoinReq = (data) => onNewJoinRequest?.(data);

    const handleUserJoined = (data) => {
      setStatusMessage(`👋 ${data.name} joined`);
      setTimeout(() => setStatusMessage(""), 3000);
      onUserJoined?.(data);
    };

    const handleUserLeft = (data) => {
      setStatusMessage(`🚶 ${data.name} left`);
      setTimeout(() => setStatusMessage(""), 3000);
      onUserLeft?.(data);
    };

    const handleReceiveMessage = (data) => {
      setMessages((prev) => [
        ...prev,
        { ...data, isSelf: data.name === name },
      ]);
    };

    socket.on("newjoinreq", handleNewJoinReq);
    socket.on("userJoined", handleUserJoined);
    socket.on("userLeft", handleUserLeft);
    socket.on("receive-message", handleReceiveMessage);

    return () => {
      socket.off("newjoinreq", handleNewJoinReq);
      socket.off("userJoined", handleUserJoined);
      socket.off("userLeft", handleUserLeft);
      socket.off("receive-message", handleReceiveMessage);
    };
  }, [name, onNewJoinRequest, onUserJoined, onUserLeft]);

  // send message
  const handleSend = () => {
    const socket = getSocket();
    if (!newMessage.trim() || !socket) return;

    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const msgData = { name, text: newMessage, time, room };

    socket.emit("send-message", msgData);

    setMessages((prev) => [
      ...prev,
      { ...msgData, isSelf: true },
    ]);

    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-[#1a1a1a] to-[#121212] relative">

      {/* Status Banner */}
      {statusMessage && (
        <div className="absolute top-16 left-0 right-0 z-20 flex justify-center">
          <div className="bg-orange-500/10 border border-orange-500/30 backdrop-blur-lg px-5 py-1.5 rounded-full shadow-md">
            <p className="text-orange-400 text-xs font-medium tracking-wide">
              {statusMessage}
            </p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide"
      >
        <div className="flex flex-col justify-end min-h-full space-y-5">

          {messages.length === 0 && (
            <p className="text-center text-gray-500 text-sm italic mt-16">
              Start the conversation 🚀
            </p>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.isSelf ? "justify-end" : "justify-start"
              }`}
            >
              <div className="flex items-end gap-2 max-w-[75%]">

                {/* Avatar */}
                {!msg.isSelf && (
                  <div className="w-7 h-7 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-xs font-semibold text-orange-400">
                    {msg.name?.charAt(0)}
                  </div>
                )}

                {/* Bubble */}
                <div>
                  <div
                    className={`px-4 py-2.5 text-sm leading-relaxed shadow-md ${
                      msg.isSelf
                        ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl rounded-br-md"
                        : "bg-[#2a2a2a] text-gray-200 border border-white/5 rounded-2xl rounded-bl-md"
                    }`}
                  >
                    {msg.text}
                  </div>

                  <p className="text-[10px] text-gray-500 mt-1 px-1">
                    {msg.time}
                  </p>
                </div>
              </div>
            </div>
          ))}

        </div>
      </div>

      {/* Input */}
      <div className="p-3 border-t border-white/5 bg-[#121212]/80 backdrop-blur-lg">
        <div className="flex items-center gap-2 bg-[#1f1f1f] rounded-2xl px-3 py-2 border border-white/5 focus-within:border-orange-500/40 transition">

          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && handleSend()
            }
            placeholder="Type a message..."
            className="flex-1 bg-transparent outline-none text-sm text-gray-200 placeholder-gray-500"
          />

          <button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 transition shadow-md"
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>

        </div>
      </div>
    </div>
  );
});