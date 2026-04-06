import { useEffect, useState, useRef, useImperativeHandle, forwardRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setRoomcode, clearUser } from "../Redux/Features/UserSlice";
import { createSocket } from "../Api/ws";

export const Chat = forwardRef(function Chat({ onNewJoinRequest, onRequestAccepted, onUserJoined, onUserLeft, onRequestRejected }, ref) {
  const [waiting, setWaiting] = useState(false);
  const [message, setMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [isJoined, setIsJoined] = useState(false); 
  
  const { roomcode } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const socketRef = useRef(null);
  
  // Expose socket to parent component
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

    console.log("✅ Socket created:", newSocket.id);
    console.log("✅ Socket is connected:", newSocket.connected);

    const handleDisconnect = (reason) => {
      console.log("User disconnected because:", reason);
      
      if (reason !== "io server disconnect") {
        dispatch(clearUser());
        navigate("/");
      } else {
        setTimeout(() => {
          newSocket.connect();
        }, 1000);
      }
    };

    newSocket.on("disconnect", handleDisconnect);

    const handleConnectError = (error) => {
      console.error("Connection error:", error);
      setMessage("Connection error. Please refresh the page.");
    };

    newSocket.on("connect_error", handleConnectError);

    return () => {
      newSocket.off("disconnect", handleDisconnect);
      newSocket.off("connect_error", handleConnectError);
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [name, dispatch, navigate]);

  useEffect(() => {
    dispatch(setRoomcode(roomcode));
  }, [roomcode, dispatch]);

  useEffect(() => {
    if (!socket || !name || !room || isJoined) return;

    console.log("Joining room:", room, "Role:", role);

    if (role === "Owner") {
      socket.emit("owner-join", {
        roomcode: room,
        name,
        role,
        ownerid: socket.id
      });
      setIsJoined(true);
    } else if (role === "user") {
      socket.emit("user-join-request", {
        roomcode: room,
        name,
        role,
      });
      setWaiting(true);
      setMessage("Waiting for owner to approve your join request...");
      setIsJoined(true);
    }

  }, [socket, name, role, room, isJoined]);

  useEffect(() => {
    if (!socket) return;

    const handleNewJoinReq = (data) => {
      console.log("New join request:", data);
      if (onNewJoinRequest) onNewJoinRequest(data);
    };

    const handleRequestAccepted = (data) => {
      console.log("Request accepted", data);
      setWaiting(false);
      setMessage("✅ Your request was accepted!");
      setTimeout(() => setMessage(""), 2000);
      if (onRequestAccepted) onRequestAccepted(data);
    };

    const handleUserJoined = (data) => {
      console.log("User joined:", data);
      setMessage(`👋 ${data.name} joined the room`);
      setTimeout(() => setMessage(""), 2000);
      if (onUserJoined) onUserJoined(data);
    };

    const handleUserLeft = (data) => {
      console.log("User left:", data);
      setMessage(`👋 ${data.name} left the room`);
      setTimeout(() => setMessage(""), 2000);
      if (onUserLeft) onUserLeft(data);
    };

    const handleRequestRejected = (data) => {
      console.log("Request rejected");
      setWaiting(false);
      setMessage(data.message || "❌ Request rejected.");
      setTimeout(() => {
        dispatch(clearUser());
        navigate("/");
      }, 2000);
      if (onRequestRejected) onRequestRejected(data);
    };

    socket.on("newjoinreq", handleNewJoinReq);
    socket.on("requestAccepted", handleRequestAccepted);
    socket.on("userJoined", handleUserJoined);
    socket.on("userLeft", handleUserLeft);
    socket.on("requestRejected", handleRequestRejected);

    return () => {
      socket.off("newjoinreq", handleNewJoinReq);
      socket.off("requestAccepted", handleRequestAccepted);
      socket.off("userJoined", handleUserJoined);
      socket.off("userLeft", handleUserLeft);
      socket.off("requestRejected", handleRequestRejected);
    };
  }, [socket, dispatch, navigate, onNewJoinRequest, onRequestAccepted, onUserJoined, onUserLeft, onRequestRejected]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      dispatch(clearUser());
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [dispatch]);

  if (!name || name === "") {
    return <div className="p-4">Redirecting to home...</div>;
  }

  if (!socket) {
    return <div className="p-4">🔌 Connecting to server...</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">
        {waiting ? "⏳ Waiting for approval..." : "💬 Chat Room"}
      </h2>
      {message && (
        <p className="text-lg text-blue-600 mb-4">{message}</p>
      )}
    </div>
  );
});