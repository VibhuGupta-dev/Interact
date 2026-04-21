import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { createSocket } from "../Api/ws";
import { useSelector } from "react-redux";

// ── Grid Config ────────────────────────────────────────────────────────────
function getGridConfig(n) {
  if (n === 1) return { cols: 1, rows: 1 };
  if (n === 2) return { cols: 2, rows: 1 };
  if (n === 3) return { cols: 3, rows: 1 };
  if (n === 4) return { cols: 2, rows: 2 };
  if (n <= 6) return { cols: 3, rows: 2 };
  if (n <= 9) return { cols: 3, rows: 3 };
  return { cols: 4, rows: Math.ceil(n / 4) };
}

// Mobile: max 2 cols
function getMobileGridConfig(n) {
  if (n === 1) return { cols: 1, rows: 1 };
  if (n === 2) return { cols: 2, rows: 1 };
  if (n <= 4) return { cols: 2, rows: 2 };
  if (n <= 6) return { cols: 2, rows: 3 };
  return { cols: 2, rows: Math.ceil(n / 2) };
}

// ── Icons ──────────────────────────────────────────────────────────────────
const MicIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);
const MicOffIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <line x1="1" y1="1" x2="23" y2="23" />
    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
    <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);
const CamIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);
const CamOffIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <line x1="1" y1="1" x2="23" y2="23" />
    <path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3m3-3h6l2 3h1a2 2 0 0 1 2 2v9.34" />
    <line x1="16" y1="12" x2="23" y2="7" />
    <line x1="23" y1="17" x2="16" y2="12" />
  </svg>
);
const PhoneOffIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45c1.12.45 2.3.78 3.53.98a2 2 0 0 1 1.7 2v3a2 2 0 0 1-2.18 2C6.72 21.5 2.5 17.28 2.5 12a2 2 0 0 1 2-2.18h3a2 2 0 0 1 2 1.72c.2 1.23.53 2.41.98 3.53a2 2 0 0 1-.45 2.11L8.76 18.1" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);
const MicOffSmall = () => (
  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <line x1="1" y1="1" x2="23" y2="23" />
    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
    <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);
const ScreenShareIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
    <polyline points="7 10 12 5 17 10" />
    <line x1="12" y1="5" x2="12" y2="15" />
  </svg>
);
const ScreenShareOffIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
    <polyline points="7 15 12 20 17 15" />
    <line x1="12" y1="20" x2="12" y2="10" />
  </svg>
);

// ── Hook: detect mobile ────────────────────────────────────────────────────
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
}

// ── Avatar ─────────────────────────────────────────────────────────────────
const AvatarPlaceholder = ({ name = "?", small = false }) => {
  const initials = name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1a1a1a]">
      <div className={`${small ? "w-8 h-8 text-xs" : "w-14 h-14 text-xl"} rounded-xl bg-orange-500 flex items-center justify-center text-white font-bold`}>
        {initials}
      </div>
      {!small && <p className="mt-2 text-[#e8e8e8]/60 text-sm font-medium">{name}</p>}
    </div>
  );
};

// ── Tile Overlay ───────────────────────────────────────────────────────────
const TileOverlay = ({ displayName, micOn, small = false }) => (
  <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-2 py-1.5 bg-gradient-to-t from-black/70 to-transparent">
    <div className="flex items-center gap-1 min-w-0">
      <div className={`${small ? "w-4 h-4 text-[8px]" : "w-5 h-5 text-[9px]"} rounded-md bg-orange-500 flex items-center justify-center font-bold text-white flex-shrink-0`}>
        {displayName?.charAt(0)?.toUpperCase()}
      </div>
      {!small && (
        <span className="text-[#e8e8e8] text-xs font-medium truncate">{displayName}</span>
      )}
    </div>
    {!micOn && (
      <span className="flex items-center justify-center w-4 h-4 rounded-full bg-red-500/90 text-white flex-shrink-0">
        <MicOffSmall />
      </span>
    )}
  </div>
);

// ── Remote Video Tile ──────────────────────────────────────────────────────
const RemoteVideo = React.memo(({ userId, streamRef, peerStates, small, streamVersion }) => {
  const users = useSelector((store) => store.User.users);
  const videoEl = useRef(null);
  const user = users.find((u) => u.userId === userId || u.socketId === userId);
  const displayName = user?.name || user?.username || userId;
  const { micOn = true, camOn = true } = peerStates[userId] || {};

  useEffect(() => {
    const stream = streamRef.current[userId];
    if (videoEl.current && stream) videoEl.current.srcObject = stream;
  }, [userId, streamRef, users, streamVersion]);

  return (
    <div className="relative w-full h-full bg-[#1e1e1e] rounded-xl overflow-hidden border border-white/[0.05]">
      <video
        ref={videoEl}
        autoPlay playsInline
        className={`w-full h-full object-cover transition-opacity duration-300 ${!camOn ? "opacity-0" : "opacity-100"}`}
      />
      {!camOn && <AvatarPlaceholder name={displayName} small={small} />}
      <TileOverlay displayName={displayName} micOn={micOn} small={small} />
    </div>
  );
});

// ── Control Button ─────────────────────────────────────────────────────────
const ControlBtn = ({ onClick, active, danger = false, children, label }) => (
  <button
    onClick={onClick}
    title={label}
    className={`
      flex items-center justify-center w-12 h-12 sm:w-11 sm:h-11 rounded-2xl sm:rounded-xl border transition-all duration-200 active:scale-95
      ${danger
        ? "bg-red-500/15 border-red-500/30 text-red-400 hover:bg-red-500/25"
        : active
          ? "bg-white/[0.07] border-white/[0.1] text-[#e8e8e8] hover:bg-white/12"
          : "bg-red-500/15 border-red-500/30 text-red-400 hover:bg-red-500/25"
      }
    `}
  >
    {children}
  </button>
);

// ── Screen Viewer ──────────────────────────────────────────────────────────
const ScreenViewer = ({ isLocalShare, localScreenRef, remoteStream, presenterName }) => {
  const remoteVideoEl = useRef(null);
  useEffect(() => {
    if (!isLocalShare && remoteVideoEl.current && remoteStream) {
      remoteVideoEl.current.srcObject = remoteStream;
    }
  }, [isLocalShare, remoteStream]);

  return (
    <div className="relative w-full h-full bg-[#0d0d0d] rounded-xl sm:rounded-2xl overflow-hidden border border-white/[0.06] flex items-center justify-center">
      {isLocalShare
        ? <video ref={localScreenRef} autoPlay playsInline muted className="w-full h-full object-contain" />
        : <video ref={remoteVideoEl} autoPlay playsInline className="w-full h-full object-contain" />
      }
      <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/55 backdrop-blur-sm rounded-lg px-2 py-1 pointer-events-none">
        <span className={`w-1.5 h-1.5 rounded-full ${isLocalShare ? "bg-green-400" : "bg-blue-400"} animate-pulse`} />
        <span className="text-white/90 text-[10px] sm:text-xs font-medium">
          {isLocalShare ? "You are presenting" : `${presenterName} is presenting`}
        </span>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════
export function VideoStream() {
  const { roomcode } = useParams();
  const isMobile = useIsMobile();

  const socketRef = useRef(null);
  const peersRef = useRef({});
  const localStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteStreams = useRef({});
  const iceBufRef = useRef({});
  const cleanupRef = useRef(null);
  const localScreenStreamRef = useRef(null);
  const screenVideoRef = useRef(null);

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [remoteScreenInfo, setRemoteScreenInfo] = useState(null);
  const [remoteUserIds, setRemoteUserIds] = useState([]);
  const [peerStates, setPeerStates] = useState({});
  const [streamVersions, setStreamVersions] = useState({});

  const myName = useSelector((store) => store.User.name || "You");
  const users = useSelector((store) => store.User.users);

  const anyoneSharing = screenSharing || !!remoteScreenInfo;
  const totalParticipants = remoteUserIds.length + 1;
  const desktopGrid = getGridConfig(totalParticipants);
  const mobileGrid = getMobileGridConfig(totalParticipants);
  const { cols, rows } = isMobile ? mobileGrid : desktopGrid;
  const isSmallTile = totalParticipants > 4;

  // Local video sync
  useEffect(() => {
    const el = localVideoRef.current;
    const stream = localStreamRef.current;
    if (el && stream && el.srcObject !== stream) {
      el.srcObject = null;
      el.srcObject = stream;
      el.play().catch(() => {});
    }
  }, [totalParticipants, anyoneSharing]);

  const toggleMic = () => {
    const newVal = !micOn;
    setMicOn(newVal);
    localStreamRef.current?.getAudioTracks().forEach((t) => (t.enabled = newVal));
    socketRef.current?.emit("media-state", { roomcode, micOn: newVal, camOn });
  };

  const toggleCam = () => {
    const newVal = !camOn;
    setCamOn(newVal);
    localStreamRef.current?.getVideoTracks().forEach((t) => (t.enabled = newVal));
    socketRef.current?.emit("media-state", { roomcode, micOn, camOn: newVal });
  };

  const toggleScreenShare = useCallback(async () => {
    if (screenSharing) {
      localScreenStreamRef.current?.getTracks().forEach((t) => t.stop());
      localScreenStreamRef.current = null;
      const camVideoTrack = localStreamRef.current?.getVideoTracks()[0];
      if (camVideoTrack) {
        camVideoTrack.enabled = true;
        Object.values(peersRef.current).forEach((peer) => {
          const sender = peer.getSenders().find((s) => s.track?.kind === "video");
          if (sender) sender.replaceTrack(camVideoTrack);
        });
      }
      if (localVideoRef.current && localStreamRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
      if (screenVideoRef.current) screenVideoRef.current.srcObject = null;
      socketRef.current?.emit("screen-share-state", { roomcode, sharing: false });
      setCamOn(true);
      socketRef.current?.emit("media-state", { roomcode, micOn, camOn: true });
      setScreenSharing(false);
      return;
    }
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      localScreenStreamRef.current = screenStream;
      screenStream.getVideoTracks()[0].onended = () => toggleScreenShare();
      if (screenVideoRef.current) screenVideoRef.current.srcObject = screenStream;
      const screenVideoTrack = screenStream.getVideoTracks()[0];
      Object.values(peersRef.current).forEach((peer) => {
        const sender = peer.getSenders().find((s) => s.track?.kind === "video");
        if (sender) sender.replaceTrack(screenVideoTrack);
      });
      socketRef.current?.emit("screen-share-state", { roomcode, sharing: true });
      setScreenSharing(true);
    } catch (err) {
      console.error("[ScreenShare] FAILED:", err.name, err.message);
    }
  }, [screenSharing, roomcode]);

  const getUserMediaStream = useCallback(async () => {
    try {
      const existing = localStreamRef.current;
      const allLive = existing?.getTracks().every((t) => t.readyState === "live");
      if (existing && allLive) {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = null;
          localVideoRef.current.srcObject = existing;
        }
        return existing;
      }
      existing?.getTracks().forEach((t) => t.stop());
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
        localVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch (err) {
      console.error("[getUserMedia] FAILED:", err.name, err.message);
      return null;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const setup = async () => {
      const stream = await getUserMediaStream();
      if (!stream || !isMounted) return;
      const socket = createSocket();
      if (!socket) return;
      socketRef.current = socket;

      const createPeer = (userId) => {
        if (peersRef.current[userId]) peersRef.current[userId].close();
        const peer = new RTCPeerConnection({
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
          ],
        });
        localStreamRef.current?.getTracks().forEach((track) => peer.addTrack(track, localStreamRef.current));
        const incomingStream = new MediaStream();
        remoteStreams.current[userId] = incomingStream;
        peer.ontrack = (event) => {
          incomingStream.addTrack(event.track);
          if (isMounted) {
            setStreamVersions((prev) => ({ ...prev, [userId]: (prev[userId] || 0) + 1 }));
            setRemoteUserIds((prev) => prev.includes(userId) ? prev : [...prev, userId]);
          }
        };
        peer.onicecandidate = (event) => {
          if (event.candidate)
            socket.emit("ice-candidate", { candidate: event.candidate, to: userId, roomcode });
        };
        peer.onconnectionstatechange = () =>
          console.log(`[${userId}] connectionState: ${peer.connectionState}`);
        return peer;
      };

      const flushIce = async (userId) => {
        const buf = iceBufRef.current[userId] || [];
        const peer = peersRef.current[userId];
        if (!peer || buf.length === 0) return;
        for (const c of buf) {
          try { await peer.addIceCandidate(new RTCIceCandidate(c)); }
          catch (e) { console.error(`[${userId}] ICE flush:`, e); }
        }
        iceBufRef.current[userId] = [];
      };

      const handleUserJoinRtc = async ({ userId }) => {
        const peer = createPeer(userId);
        peersRef.current[userId] = peer;
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        socket.emit("offer", { offer: peer.localDescription, roomcode, to: userId });
      };
      const handleVideoCall = async ({ from, offer }) => {
        const peer = createPeer(from);
        peersRef.current[from] = peer;
        await peer.setRemoteDescription(new RTCSessionDescription(offer));
        await flushIce(from);
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        socket.emit("answer", { answer, to: from, roomcode });
      };
      const handleAnswerReceived = async ({ from, answer }) => {
        const peer = peersRef.current[from];
        if (!peer) return;
        await peer.setRemoteDescription(new RTCSessionDescription(answer));
        await flushIce(from);
      };
      const handleIceCandidate = async ({ from, candidate }) => {
        const peer = peersRef.current[from];
        if (!peer || !candidate) return;
        if (peer.remoteDescription?.type) {
          try { await peer.addIceCandidate(new RTCIceCandidate(candidate)); }
          catch (e) { console.error(`[${from}] ICE:`, e); }
        } else {
          if (!iceBufRef.current[from]) iceBufRef.current[from] = [];
          iceBufRef.current[from].push(candidate);
        }
      };
      const handleUserLeft = ({ userId }) => {
        console.log(users);
        if (peersRef.current[userId]) { peersRef.current[userId].close(); delete peersRef.current[userId]; }
        console.log(users);
        delete remoteStreams.current[userId];
        setRemoteUserIds((prev) => prev.filter((id) => id !== userId));
        setPeerStates((prev) => { const next = { ...prev }; delete next[userId]; return next; });
        setStreamVersions((prev) => { const next = { ...prev }; delete next[userId]; return next; });
        setRemoteScreenInfo((prev) => prev?.userId === userId ? null : prev);
      };
      const handleMediaState = ({ from, micOn, camOn }) => {
        setPeerStates((prev) => ({ ...prev, [from]: { micOn, camOn } }));
      };
      const handleScreenShareState = ({ from, sharing }) => {
        if (sharing) {
          const stream = remoteStreams.current[from];
          setRemoteScreenInfo({ userId: from, stream });
        } else {
          setRemoteScreenInfo(null);
        }
      };

      socket.on("user-join-rtc", handleUserJoinRtc);
      socket.on("videocall", handleVideoCall);
      socket.on("answer-received", handleAnswerReceived);
      socket.on("ice-candidate", handleIceCandidate);
      socket.on("media-state", handleMediaState);
      socket.on("userLeft", handleUserLeft);
      socket.on("screen-share-state", handleScreenShareState);
      socket.emit("user-ready-rtc", { roomcode });

      cleanupRef.current = () => {
        socket.off("user-join-rtc", handleUserJoinRtc);
        socket.off("videocall", handleVideoCall);
        socket.off("answer-received", handleAnswerReceived);
        socket.off("ice-candidate", handleIceCandidate);
        socket.off("media-state", handleMediaState);
        socket.off("userLeft", handleUserLeft);
        socket.off("screen-share-state", handleScreenShareState);
        Object.values(peersRef.current).forEach((p) => p.close());
        peersRef.current = {};
        localStreamRef.current?.getTracks().forEach((t) => t.stop());
        localScreenStreamRef.current?.getTracks().forEach((t) => t.stop());
        localScreenStreamRef.current = null;
      };
    };
    setup();
    return () => { isMounted = false; cleanupRef.current?.(); };
  }, [roomcode, getUserMediaStream]);

  const getPresenterName = (userId) => {
    if (!userId) return "";
    const user = users.find((u) => u.userId === userId || u.socketId === userId);
    return user?.name || user?.username || userId;
  };

  // ── Sidebar width responsive ──
  const sidebarWidth = isMobile ? "100px" : "168px";

  // ══════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════
  return (
    <div className="w-full h-full min-h-0 flex flex-col overflow-hidden rounded-2xl sm:rounded-3xl bg-[#111111]">

      {/* ── Video Area ── */}
      <div className="flex-1 min-h-0 overflow-hidden">

        {/* ═══════════════════════ SCREEN SHARE LAYOUT ═══════════════════════ */}
        {anyoneSharing ? (
          <div className="w-full h-full flex p-1.5 sm:p-2 gap-1.5 sm:gap-2">

            {/* Screen tile */}
            <div className="flex-1 min-w-0 min-h-0">
              <ScreenViewer
                isLocalShare={screenSharing}
                localScreenRef={screenVideoRef}
                remoteStream={remoteScreenInfo?.stream ?? null}
                presenterName={getPresenterName(remoteScreenInfo?.userId)}
              />
            </div>

            {/* Right sidebar — square tiles */}
            <div
              className="flex-shrink-0 flex flex-col gap-1.5 sm:gap-2 overflow-y-auto overflow-x-hidden py-0.5"
              style={{ width: sidebarWidth }}
            >
              {/* My camera */}
              <div
                className="relative w-full flex-shrink-0 bg-[#1e1e1e] rounded-xl overflow-hidden border border-white/[0.05]"
                style={{ aspectRatio: "1 / 1" }}
              >
                <video
                  ref={localVideoRef}
                  autoPlay playsInline muted
                  className={`w-full h-full object-cover transition-opacity duration-300 ${!camOn ? "opacity-0" : "opacity-100"}`}
                />
                {!camOn && <AvatarPlaceholder name={myName} small />}
                <TileOverlay displayName="You" micOn={micOn} small={isMobile} />
              </div>

              {/* Remote cameras */}
              {remoteUserIds.map((userId) => (
                <div key={userId} className="relative w-full flex-shrink-0" style={{ aspectRatio: "1 / 1" }}>
                  <RemoteVideo
                    userId={userId}
                    streamRef={remoteStreams}
                    peerStates={peerStates}
                    small
                    streamVersion={streamVersions[userId] || 0}
                  />
                </div>
              ))}
            </div>
          </div>

        ) : (
          /* ═══════════════════════ NORMAL GRID LAYOUT ═══════════════════════ */
          <div className="w-full h-full flex items-center justify-center p-1.5 sm:p-2">
            {totalParticipants === 1 ? (
              // Solo — centred square
              <div
                className="relative bg-[#1e1e1e] rounded-2xl overflow-hidden border border-white/[0.05]"
                style={{
                  width: isMobile ? "75vw" : "min(35%, calc(100vh - 140px))",
                  aspectRatio: "1 / 1",
                }}
              >
                <video
                  ref={localVideoRef}
                  autoPlay playsInline muted
                  className={`w-full h-full object-cover transition-opacity duration-300 ${!camOn ? "opacity-0" : "opacity-100"}`}
                />
                {!camOn && <AvatarPlaceholder name={myName} />}
                <TileOverlay displayName="You" micOn={micOn} />
              </div>
            ) : (
              // Grid
              <div
                className="w-full h-full min-h-0"
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
                  gap: isMobile ? "4px" : "6px",
                }}
              >
                {/* My tile */}
                <div
                  className="relative bg-[#1e1e1e] rounded-xl overflow-hidden border border-white/[0.05]"
                  style={{ aspectRatio: "1 / 1" }}
                >
                  <video
                    ref={localVideoRef}
                    autoPlay playsInline muted
                    className={`w-full h-full object-cover transition-opacity duration-300 ${!camOn ? "opacity-0" : "opacity-100"}`}
                  />
                  {!camOn && <AvatarPlaceholder name={myName} small={isSmallTile || isMobile} />}
                  <TileOverlay displayName="You" micOn={micOn} small={isMobile && isSmallTile} />
                </div>

                {/* Remote tiles */}
                {remoteUserIds.map((userId) => (
                  <div key={userId} style={{ aspectRatio: "1 / 1" }}>
                    <RemoteVideo
                      userId={userId}
                      streamRef={remoteStreams}
                      peerStates={peerStates}
                      small={isSmallTile || isMobile}
                      streamVersion={streamVersions[userId] || 0}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Control Bar ── */}
      {/* Mobile: larger touch targets, pill shape, floating look */}
      <div className="flex-shrink-0 flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-2.5 px-4 border-t border-white/[0.05] bg-[#1a1a1a]/80 backdrop-blur-sm">
        <ControlBtn onClick={toggleMic} active={micOn} label={micOn ? "Mute mic" : "Unmute mic"}>
          {micOn ? <MicIcon /> : <MicOffIcon />}
        </ControlBtn>
        <ControlBtn onClick={toggleCam} active={camOn} label={camOn ? "Camera off" : "Camera on"}>
          {camOn ? <CamIcon /> : <CamOffIcon />}
        </ControlBtn>
        {/* Screen share — hide on mobile since getDisplayMedia not supported on most mobile browsers */}
        {!isMobile && (
          <ControlBtn onClick={toggleScreenShare} active={screenSharing} label={screenSharing ? "Stop sharing" : "Share screen"}>
            {screenSharing ? <ScreenShareOffIcon /> : <ScreenShareIcon />}
          </ControlBtn>
        )}
        <div className="w-px h-5 bg-white/10" />
        <ControlBtn onClick={() => window.history.back()} danger label="Leave call">
          <PhoneOffIcon />
        </ControlBtn>
      </div>
    </div>
  );
}