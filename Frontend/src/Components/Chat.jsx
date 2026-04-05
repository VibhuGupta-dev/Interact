import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setRoomcode, clearUser } from "../Redux/Features/UserSlice"; // ✅ Import clearUser
import { createSocket } from "../Api/ws";

export function Chat() {
  const [waiting, setWaiting] = useState(false);
  const [message, setMessage] = useState("");
  const [pendingRequest, setPendingRequest] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isJoined, setIsJoined] = useState(false); // ✅ Track join status
  const [requests, setRequests] = useState([]);
  
  const { roomcode } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const socketRef = useRef(null); // ✅ Keep socket reference
  
  const room = useSelector((store) => store.User.roomcode);
  const name = useSelector((store) => store.User.name);
  const role = useSelector((store) => store.User.role);
  // ✅ Socket initialization (ek hi baar)
  useEffect(() => {
    // Agar name nahi h to home jao
    if (!name || name === "") {
      dispatch(clearUser());
      navigate("/");
      return;
    }

    const newSocket = createSocket();
    socketRef.current = newSocket;
    setSocket(newSocket);

    console.log("Socket created:", newSocket.id);

    // ✅ Disconnect handler
    const handleDisconnect = (reason) => {
      console.log("User disconnected because:", reason);
      
      // ❌ Server se na reconnect karo
      if (reason !== "io server disconnect") {
        // Normal disconnect - user closed connection
        dispatch(clearUser());
        navigate("/");
      } else {
        // Server se disconnect - try reconnect once
        setTimeout(() => {
          newSocket.connect();
        }, 1000);
      }
    };

    newSocket.on("disconnect", handleDisconnect);

    // ✅ Connection error handling
    const handleConnectError = (error) => {
      console.error("Connection error:", error);
      setMessage("Connection error. Please refresh the page.");
    };

    newSocket.on("connect_error", handleConnectError);

    // Cleanup
    return () => {
      newSocket.off("disconnect", handleDisconnect);
      newSocket.off("connect_error", handleConnectError);
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [name, dispatch, navigate]);

  // ✅ Room code update
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

    // Event handlers
    const handleNewJoinReq = (data) => {
      console.log("New join request:", data);
      setRequests((prev) => [...prev, data]);
      setPendingRequest({ userId: data.userId, name: data.name });
      setMessage(data.message);
      setWaiting(false);
    };

    const handleRequestAccepted = (data) => {
      console.log("Request accepted", data);
      setWaiting(false);
      setMessage("✅ Your request was accepted!");
      setTimeout(() => setMessage(""), 2000);
    };

    const handleUserJoined = (data) => {
      console.log("User joined:", data);
      setMessage(`👋 ${data.name} joined the room`);
      setTimeout(() => setMessage(""), 2000);
    };

    const handleUserLeft = (data) => {
      console.log("User left:", data);
      setMessage(`👋 ${data.name} left the room`);
      setTimeout(() => setMessage(""), 2000);
    };

    const handleRequestRejected = (data) => {
      console.log("Request rejected");
      setWaiting(false);
      setMessage(data.message || "❌ Request rejected.");
      setTimeout(() => {
        dispatch(clearUser());
        navigate("/");
      }, 2000);
    };

    socket.on("newjoinreq", handleNewJoinReq);
    socket.on("requestAccepted", handleRequestAccepted);
    socket.on("userJoined", handleUserJoined);
    socket.on("leave-room", handleUserLeft);
    socket.on("requestRejected", handleRequestRejected);

   
    return () => {
      socket.off("newjoinreq", handleNewJoinReq);
      socket.off("requestAccepted", handleRequestAccepted);
      socket.off("userJoined", handleUserJoined);
      socket.off("userLeft", handleUserLeft);
      socket.off("requestRejected", handleRequestRejected);
    };
  }, [socket, dispatch, navigate]);

 
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

  const handleAccept = (request) => {
    if (!request || !socket) return;

    socket.emit("acceptJoinRequest", {
      roomcode: room,
      userId: request.userId,
      name: request.name,
      role: "member",
    });

    setRequests((prev) => prev.filter((req) => req.userId !== request.userId));
    if (pendingRequest?.userId === request.userId) {
      setPendingRequest(null);
    }
    setMessage("");
  };

  const handleReject = (request) => {
    if (!request || !socket) return;

    socket.emit("rejectJoinRequest", {
      roomcode: room,
      userId: request.userId,
    });

    setRequests((prev) => prev.filter((req) => req.userId !== request.userId));
    if (pendingRequest?.userId === request.userId) {
      setPendingRequest(null);
    }
    setMessage("Join request rejected.");
  };

  
  if (!name || name === "") {
    return <div className="p-4">Redirecting to home...</div>;
  }

  if (!socket) {
    return <div className="p-4">🔌 Connecting to server...</div>;
  }

  return (
    <div className="p-6">
      {role === "Owner" && requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req.userId} className="border p-4 rounded">
              <h2 className="text-lg font-bold mb-4">Join Request</h2>
              <p className="text-md mb-4">{req.message || `${req.name} wants to join the room.`}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAccept(req)}
                  className="h-10 px-6 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  ✅ Accept
                </button>
                <button
                  onClick={() => handleReject(req)}
                  className="h-10 px-6 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  ❌ Reject
                </button>
              </div>
            </div>
          ))}
        </div>
        
      ) : (
        <div>
          <h2 className="text-xl font-bold mb-4">
            {waiting ? "⏳ Waiting for approval..." : "💬 Chat Room"}
          </h2>
          {message && (
            <p className="text-lg text-blue-600 mb-4">{message}</p>
          )}
        </div>
      )}
    </div>
  );
}