import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { getSocket } from "../Api/ws";
import { useSelector } from "react-redux";

// ── Grid Config ────────────────────────────────────────────────────────────
function getGridConfig(n) {
  if (n === 1) return { cols: 1, rows: 1 };
  if (n === 2) return { cols: 2, rows: 1 };
  if (n === 3) return { cols: 3, rows: 1 };
  if (n === 4) return { cols: 2, rows: 2 };
  if (n <= 6)  return { cols: 3, rows: 2 };
  if (n <= 9)  return { cols: 3, rows: 3 };
  return { cols: 4, rows: Math.ceil(n / 4) };
}

// ── Icons ──────────────────────────────────────────────────────────────────
const MicIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);

const MicOffIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <line x1="1" y1="1" x2="23" y2="23"/>
    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/>
    <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);

const CamIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7"/>
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
  </svg>
);

const CamOffIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <line x1="1" y1="1" x2="23" y2="23"/>
    <path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3m3-3h6l2 3h1a2 2 0 0 1 2 2v9.34"/>
    <line x1="16" y1="12" x2="23" y2="7"/>
    <line x1="23" y1="17" x2="16" y2="12"/>
  </svg>
);

const PhoneOffIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45c1.12.45 2.3.78 3.53.98a2 2 0 0 1 1.7 2v3a2 2 0 0 1-2.18 2C6.72 21.5 2.5 17.28 2.5 12a2 2 0 0 1 2-2.18h3a2 2 0 0 1 2 1.72c.2 1.23.53 2.41.98 3.53a2 2 0 0 1-.45 2.11L8.76 18.1"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const MicOffSmall = () => (
  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <line x1="1" y1="1" x2="23" y2="23"/>
    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/>
    <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/>
    <line x1="12" y1="19" x2="12" y2="23"/>
    <line x1="8" y1="23" x2="16" y2="23"/>
  </svg>
);

// ── Avatar ─────────────────────────────────────────────────────────────────
const AvatarPlaceholder = ({ name = "?", small = false }) => {
  const initials = name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1a1a1a]">
      <div className={`${ small ? "w-9 h-9 text-sm" : "w-14 h-14 text-xl" } rounded-xl bg-orange-500 flex items-center justify-center text-white font-bold`}>
        {initials}
      </div>
      {!small && <p className="mt-2 text-[#e8e8e8]/60 text-sm font-medium">{name}</p>}
    </div>
  );
};

// ── Tile Overlay ───────────────────────────────────────────────────────────
const TileOverlay = ({ displayName, micOn }) => (
  <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-2.5 py-2 bg-gradient-to-t from-black/70 to-transparent">
    <div className="flex items-center gap-1.5 min-w-0">
      <div className="w-5 h-5 rounded-md bg-orange-500 flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0">
        {displayName?.charAt(0)?.toUpperCase()}
      </div>
      <span className="text-[#e8e8e8] text-xs font-medium truncate">{displayName}</span>
    </div>
    {!micOn && (
      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500/90 text-white flex-shrink-0 ml-1">
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
  }, [userId, streamRef, users, streamVersion]); // ✅ streamVersion se effect re-trigger hoga

  return (
    <div className="relative w-full h-full min-h-0 bg-[#1e1e1e] rounded-xl overflow-hidden border border-white/[0.05]">
      <video
        ref={videoEl}
        autoPlay
        playsInline
        className={`w-full h-full object-cover transition-opacity duration-300 ${!camOn ? "opacity-0" : "opacity-100"}`}
      />
      {!camOn && <AvatarPlaceholder name={displayName} small={small} />}
      <TileOverlay displayName={displayName} micOn={micOn} />
    </div>
  );
});

// ── Control Button ─────────────────────────────────────────────────────────
const ControlBtn = ({ onClick, active, danger = false, children, label }) => (
  <button
    onClick={onClick}
    title={label}
    className={`
      flex items-center justify-center w-11 h-11 rounded-xl border transition-all duration-200
      ${
        danger
          ? "bg-red-500/15 border-red-500/30 text-red-400 hover:bg-red-500/25 hover:border-red-500/50"
          : active
          ? "bg-white/[0.07] border-white/[0.1] text-[#e8e8e8] hover:bg-white/12"
          : "bg-red-500/15 border-red-500/30 text-red-400 hover:bg-red-500/25"
      }
    `}
  >
    {children}
  </button>
);

// ── Main VideoStream ───────────────────────────────────────────────────────
export function VideoStream() {
  const { roomcode } = useParams();
  const socketRef = useRef(null);
  const peersRef = useRef({});
  const localStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRefs = useRef({});
  const remoteStreams = useRef({});
  const iceBufRef = useRef({});
  const cleanupRef = useRef(null);

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [remoteUserIds, setRemoteUserIds] = useState([]);
  const [peerStates, setPeerStates] = useState({});
  const [streamVersions, setStreamVersions] = useState({}); // ✅ stream trigger ke liye

  const myName = useSelector((store) => store.User.name || "You");

  const totalParticipants = remoteUserIds.length + 1;
  const { cols, rows } = getGridConfig(totalParticipants);
  const isSmallTile = totalParticipants > 4;

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

  const getUserMediaStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
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

      const socket = getSocket();
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

        localStreamRef.current?.getTracks().forEach((track) =>
          peer.addTrack(track, localStreamRef.current)
        );

        const incomingStream = new MediaStream();
        remoteStreams.current[userId] = incomingStream;

        peer.ontrack = (event) => {
          incomingStream.addTrack(event.track);

          // ✅ streamVersion bump karo taaki RemoteVideo ka useEffect re-run ho
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

      const handleMediaState = ({ from, micOn, camOn }) => {
        setPeerStates((prev) => ({ ...prev, [from]: { micOn, camOn } }));
      };

      socket.on("user-join-rtc", handleUserJoinRtc);
      socket.on("videocall", handleVideoCall);
      socket.on("answer-received", handleAnswerReceived);
      socket.on("ice-candidate", handleIceCandidate);
      socket.on("media-state", handleMediaState);
      socket.emit("user-ready-rtc", { roomcode });

      cleanupRef.current = () => {
        socket.off("user-join-rtc", handleUserJoinRtc);
        socket.off("videocall", handleVideoCall);
        socket.off("answer-received", handleAnswerReceived);
        socket.off("ice-candidate", handleIceCandidate);
        socket.off("media-state", handleMediaState);
        Object.values(peersRef.current).forEach((p) => p.close());
        peersRef.current = {};
        localStreamRef.current?.getTracks().forEach((t) => t.stop());
      };
    };

    setup();
    return () => {
      isMounted = false;
      cleanupRef.current?.();
    };
  }, [roomcode, getUserMediaStream]);

  return (
    <div className="w-full h-full min-h-0 flex flex-col overflow-hidden rounded-3xl">

      {/* ── Video Grid ── */}
      <div className="flex-1 min-h-0 p-2 overflow-hidden flex items-center justify-center">
        {totalParticipants === 1 ? (

          // ── Single user: centered square tile ──
          <div className="relative bg-[#1e1e1e] rounded-xl overflow-hidden border border-white/[0.05]"
            style={{ width: "min(100%, calc(100vh - 140px))", aspectRatio: "1 / 1" }}
          >
            <video
              ref={localVideoRef}
              autoPlay playsInline muted
              className={`w-full h-full object-cover transition-opacity duration-300 ${!camOn ? "opacity-0" : "opacity-100"}`}
            />
            {!camOn && <AvatarPlaceholder name={myName} small={false} />}
            <TileOverlay displayName="You" micOn={micOn} />
          </div>

        ) : (

          // ── Multi user: grid ──
          <div
            className="w-full h-full min-h-0"
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
              gap: "6px",
            }}
          >
            {/* Local tile */}
            <div className="relative w-full h-full min-h-0 bg-[#1e1e1e] rounded-xl overflow-hidden border border-white/[0.05]">
              <video
                ref={localVideoRef}
                autoPlay playsInline muted
                className={`w-full h-full object-cover transition-opacity duration-300 ${!camOn ? "opacity-0" : "opacity-100"}`}
              />
              {!camOn && <AvatarPlaceholder name={myName} small={isSmallTile} />}
              <TileOverlay displayName="You" micOn={micOn} />
            </div>

            {/* Remote tiles */}
            {remoteUserIds.map((userId) => (
              <RemoteVideo
                key={userId}
                userId={userId}
                streamRef={remoteStreams}
                peerStates={peerStates}
                small={isSmallTile}
                streamVersion={streamVersions[userId] || 0} // ✅ pass karo
              />
            ))}
          </div>

        )}
      </div>

      {/* ── Control Bar ── */}
      <div className="flex-shrink-0 flex items-center justify-center gap-3 py-2.5 px-4 border-t border-white/[0.05] bg-[#1a1a1a]/60 backdrop-blur-sm">
        <ControlBtn onClick={toggleMic} active={micOn} label={micOn ? "Mute mic" : "Unmute mic"}>
          {micOn ? <MicIcon /> : <MicOffIcon />}
        </ControlBtn>
        <ControlBtn onClick={toggleCam} active={camOn} label={camOn ? "Camera off" : "Camera on"}>
          {camOn ? <CamIcon /> : <CamOffIcon />}
        </ControlBtn>
        <div className="w-px h-5 bg-white/10" />
        <ControlBtn onClick={() => window.history.back()} danger label="Leave call">
          <PhoneOffIcon />
        </ControlBtn>
      </div>

    </div>
  );
}