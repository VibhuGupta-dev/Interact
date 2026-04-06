import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearUser } from "../Redux/Features/UserSlice";
import { Chat } from "../Components/Chat";

export function MainScreen() {
  const [showRequests, setShowRequests] = useState(false);
  const [requestsAnimation, setRequestsAnimation] = useState(false);
  const chatRef = useRef(null);
  const [requests, setRequests] = useState([]);
  const [processingId, setProcessingId] = useState(null);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const role = useSelector((store) => store.User.role);
  const room = useSelector((store) => store.User.roomcode);
  const name = useSelector((store) => store.User.name);

  const handleNewJoinRequest = (data) => {
    setRequests((prev) => [...prev, data]);
    setRequestsAnimation(true);
    setTimeout(() => setRequestsAnimation(false), 600);
  };

  const handleRequestAccepted = (data) => {
    console.log("Request accepted", data);
  };

  const handleUserJoined = (data) => {
    console.log("User joined:", data);
  };

  const handleUserLeft = (data) => {
    console.log("User left:", data);
  };

  const handleRequestRejected = (data) => {
    dispatch(clearUser());
    navigate("/");
  };

  const handleAccept = (request) => {
    if (!request || !chatRef.current?.socket || processingId) return;
    
    setProcessingId(request.userId);

    chatRef.current.socket.emit("acceptJoinRequest", {
      roomcode: room,
      userId: request.userId,
      name: request.name,
      role: "member",
    });

    setTimeout(() => {
      setRequests((prev) => prev.filter((req) => req.userId !== request.userId));
      setProcessingId(null);
    }, 500);
  };

  const handleReject = (request) => {
    if (!request || !chatRef.current?.socket || processingId) return;
    
    setProcessingId(request.userId);

    chatRef.current.socket.emit("rejectJoinRequest", {
      roomcode: room,
      userId: request.userId,
    });

    setTimeout(() => {
      setRequests((prev) => prev.filter((req) => req.userId !== request.userId));
      setProcessingId(null);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-[#e8e8e8]">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 bg-[#1a1a1a]/80 border-b border-white/8 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto py-4 flex items-center justify-end">
          {/* Left - Logo/Room Info */}
          

          {/* Right - User Info & Notification */}
          <div className="flex items-center gap-8">
            {/* User Status */}
            <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/8">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">{name?.charAt(0).toUpperCase()}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-[#e8e8e8]">{name}</p>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
                  <p className="text-xs text-[#555] capitalize">{role}</p>
                </div>
              </div>
            </div>

            {/* Notification Bell - Always Visible */}
            {role === "Owner" && (
              <button
                onClick={() => setShowRequests(!showRequests)}
                className="relative group/bell p-2.5 rounded-lg hover:bg-white/5 transition-all duration-300"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`text-[#999] group-hover/bell:text-orange-400 transition-all duration-300 ${requestsAnimation ? 'animate-bounce' : ''}`}
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>

                {/* Badge with animation */}
                {requests.length > 0 && (
                  <div className="absolute -top-1 -right-1 flex items-center justify-center">
                    <div className="absolute inset-0 bg-orange-500 rounded-full animate-ping opacity-75"></div>
                    <div className="relative min-w-6 h-6 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 border-2 border-[#1a1a1a] flex items-center justify-center font-bold text-xs text-white shadow-lg shadow-orange-500/20">
                      {requests.length > 99 ? "99+" : requests.length}
                    </div>
                  </div>
                )}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-8 py-8">
        <Chat 
          ref={chatRef}
          onNewJoinRequest={handleNewJoinRequest}
          onRequestAccepted={handleRequestAccepted}
          onUserJoined={handleUserJoined}
          onUserLeft={handleUserLeft}
          onRequestRejected={handleRequestRejected}
        />
      </div>

      {/* Requests Modal - Premium Style */}
      {role === "Owner" && showRequests && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-md transition-all duration-300" 
          onClick={() => setShowRequests(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute top-28 right-8 w-full max-w-md bg-[#242424] rounded-2xl shadow-2xl border border-white/8 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300"
          >
            {/* Header */}
            <div className="bg-[#1a1a1a] border-b border-white/8 px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-orange-400">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#e8e8e8]">Join Requests</h2>
                    {requests.length > 0 && (
                      <p className="text-xs text-[#555] mt-0.5">{requests.length} pending approval</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setShowRequests(false)}
                  className="p-1.5 hover:bg-white/5 rounded-lg transition-colors duration-200"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#666]">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="max-h-[500px] overflow-y-auto">
              {requests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-6">
                  <div className="p-4 bg-white/5 rounded-full mb-4 border border-white/8">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#555]">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </div>
                  <p className="text-[#777] text-sm font-medium">No pending requests</p>
                  <p className="text-[#555] text-xs mt-2">Requests will appear here</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {requests.map((req, index) => (
                    <div
                      key={req.userId}
                      className={`p-4 hover:bg-white/3 transition-all duration-300 group ${processingId === req.userId ? 'opacity-50' : ''}`}
                    >
                      {/* Request Header */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center font-bold text-xs text-white shadow-md shadow-orange-500/20">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-[#e8e8e8] text-sm truncate">
                              {req.name}
                            </p>
                            <span className="px-2 py-0.5 bg-orange-500/10 text-orange-400 text-xs rounded-full border border-orange-500/20">
                              new
                            </span>
                          </div>
                          <p className="text-xs text-[#777] mt-1">
                            wants to join the room
                          </p>
                        </div>
                      </div>

                      {/* Meta Info */}
                      <div className="ml-11 mb-3">
                        <p className="text-xs text-[#555] font-mono bg-white/3 px-2.5 py-1.5 rounded-md inline-block border border-white/5">
                          {req.userId?.substring(0, 12)}...
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 ml-11">
                        <button
                          onClick={() => handleAccept(req)}
                          disabled={processingId !== null}
                          className="flex-1 px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:from-green-600/50 disabled:to-emerald-600/50 text-white text-xs font-semibold rounded-lg transition-all duration-200 active:scale-95 shadow-lg hover:shadow-green-500/30 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-green-500/20"
                        >
                          {processingId === req.userId ? (
                            <>
                              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              <span>Processing</span>
                            </>
                          ) : (
                            <>
                              <span>✓</span>
                              <span>Accept</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleReject(req)}
                          disabled={processingId !== null}
                          className="flex-1 px-3 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:from-red-600/50 disabled:to-rose-600/50 text-white text-xs font-semibold rounded-lg transition-all duration-200 active:scale-95 shadow-lg hover:shadow-red-500/30 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-red-500/20"
                        >
                          {processingId === req.userId ? (
                            <>
                              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              <span>Processing</span>
                            </>
                          ) : (
                            <>
                              <span>✕</span>
                              <span>Reject</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {requests.length > 0 && (
              <div className="bg-[#1a1a1a] border-t border-white/8 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></div>
                  <span className="text-xs text-[#777]">
                    <span className="font-semibold text-[#999]">{requests.length}</span> request{requests.length !== 1 ? 's' : ''} waiting
                  </span>
                </div>
                <span className="text-xs text-[#555]">Review pending approvals</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}