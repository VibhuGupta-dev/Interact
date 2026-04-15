import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { getSocket } from "../Api/ws";

// ✅ FIX (React.memo):
//   React.memo ensure karta hai ki yeh component SIRF tab re-render ho jab
//   uski apni props change hon (userId ya streamRef). Doosre users ke join
//   karne se iski re-render NAHI hogi.

const RemoteVideo = React.memo(({ userId, streamRef }) => {
  // Is user ke video element ka ref store karte hain
  const videoEl = useRef(null);

  useEffect(() => {
    const stream = streamRef.current[userId];
    if (videoEl.current && stream) {
      videoEl.current.srcObject = stream;
    }
  }, [userId, streamRef]);

  return (
    <div>
      <p>User: {userId}</p>
      <video
        ref={videoEl}
        autoPlay
        playsInline
        style={{
          width: "300px",
          border: "2px solid green",
          borderRadius: "8px",
          background: "#000",
        }}
      />
    </div>
  );
});

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
  const [remoteUserIds, setRemoteUserIds] = useState([]);

  const getUserMediaStream = useCallback(async () => {
    try {
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      console.log("[getUserMedia] Stream ready ✅");
      return stream;
    } catch (err) {
      console.error("[getUserMedia] FAILED:", err.name, err.message);
      return null;
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Main WebRTC + Socket Setup Effect
  //
  // Yeh effect tab chalta hai jab:
  // - Component mount hota hai (pehli baar)
  // - roomcode change hota hai (rare case)
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    // isMounted flag — agar component unmount ho jaaye toh async callbacks
    // mein state update avoid karne ke liye
    let isMounted = true;

    const setup = async () => {
      // ── Step 1: Pehle apni stream lo ─────────────────────────────────────
      // WebRTC mein pehle stream chahiye — phir connection banana chahiye
      // Ulta karne se tracks add nahi ho paate peer pe
      const stream = await getUserMediaStream();
      if (!stream) {
        console.error("[setup] Stream not available, aborting");
        return;
      }

      if (!isMounted) return; // Component unmount ho gaya toh aage mat bado

      // ── Step 2: Socket connection lo ──────────────────────────────────────
      const socket = getSocket();
      if (!socket) {
        console.error("[setup] Socket not available");
        return;
      }
      socketRef.current = socket;
      console.log("[setup] Socket ready:", socket.id);

      // ──────────────────────────────────────────────────────────────────────
      // createPeer — ek nayi RTCPeerConnection banata hai kisi ek user ke liye
      //
      // @param userId — remote user ka socket ID
      // @returns RTCPeerConnection instance
      // ──────────────────────────────────────────────────────────────────────
      const createPeer = (userId) => {
        // Agar pehle se connection hai toh band karo (rejoin case handle karta hai)
        if (peersRef.current[userId]) {
          peersRef.current[userId].close();
        }

        // RTCPeerConnection banao STUN servers ke saath
        // STUN server kaam karta hai: "Mera public IP kya hai?"
        // Bina STUN ke sirf same network mein kaam karta — internet pe nahi
        const peer = new RTCPeerConnection({
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
          ],
        });

        // ✅ Apne local tracks (camera/mic) peer connection mein add karo
        // Bina iske doosre user ko hamari video/audio nahi milegi
        const tracks = localStreamRef.current?.getTracks() || [];
        console.log(`[${userId}] Adding ${tracks.length} local tracks`);
        tracks.forEach((track) => {
          peer.addTrack(track, localStreamRef.current);
        });

        // ✅ Remote user ke tracks receive karne ke liye ek khali MediaStream banao
        const incomingStream = new MediaStream();
        remoteStreams.current[userId] = incomingStream;

        // ── ontrack: Jab remote user ke tracks aayein ─────────────────────
        // Yeh do baar fire hota hai — pehle video ke liye, phir audio ke liye
        // Isliye state update mein "already included" check zaroori hai
        peer.ontrack = (event) => {
          console.log(`[${userId}] ✅ ontrack fired! kind=${event.track.kind}`);

          // Track ko incoming stream mein add karo
          incomingStream.addTrack(event.track);

          // ✅ FLICKER FIX: srcObject sirf tab set karo jab already set na ho
          // Pehle: har ontrack pe srcObject re-assign hota tha → flicker
          // Ab: !== check se unnecessary re-assignment ruk jaati hai
          const videoEl = remoteVideoRefs.current[userId];
          if (videoEl && videoEl.srcObject !== incomingStream) {
            videoEl.srcObject = incomingStream;
            console.log(`[${userId}] srcObject set on video element`);
          } else if (!videoEl) {
            // Video element abhi DOM mein nahi hai
            // Koi baat nahi — RemoteVideo mount hone pe useEffect mein
            // remoteStreams.current se stream uthaa lega
            console.log(
              `[${userId}] video element not ready yet — stream stored in ref`,
            );
          }

          // ✅ State update: sirf pehli baar userId add karo
          // Kyunki ontrack 2 baar fire hota hai (video + audio), agar dono
          // baar setState karo toh unnecessary re-render hogi
          if (isMounted) {
            setRemoteUserIds(
              (prev) => (prev.includes(userId) ? prev : [...prev, userId]),
              //                      ^^^^ pehle se hai? toh same array return karo (no re-render)
            );
          }
        };

        // ── onicecandidate: ICE candidates server ke through doosre user ko bhejo ──
        // ICE = Interactive Connectivity Establishment
        // Ye candidates batate hain ki "mujhse kaise connect karein"
        // (local IP, public IP, TURN relay, etc.)
        peer.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("ice-candidate", {
              candidate: event.candidate,
              to: userId,
              roomcode,
            });
          }
          // event.candidate === null matlab sab candidates mil gaye (end-of-candidates)
        };

        // ── Debug listeners ────────────────────────────────────────────────
        peer.onconnectionstatechange = () => {
          console.log(`[${userId}] connectionState: ${peer.connectionState}`);
          // "connected" = video aana chahiye
          // "failed" = STUN/TURN kaam nahi kiya, ya NAT traversal fail
          if (peer.connectionState === "failed") {
            console.error(`[${userId}] ❌ Connection failed!`);
          }
        };

        peer.oniceconnectionstatechange = () => {
          console.log(
            `[${userId}] iceConnectionState: ${peer.iceConnectionState}`,
          );
          // "checking" → "connected" normal path hai
          // "disconnected" → "failed" matlabconnection toot gaya
        };

        return peer;
      };

      // ──────────────────────────────────────────────────────────────────────
      // flushIce — buffered ICE candidates add karta hai peer mein
      //
      // Problem: ICE candidates offer/answer se pehle aa sakte hain
      // Remote description set hone se pehle addIceCandidate call karo toh error aata hai
      // Solution: pehle buffer mein rakho, remote description set hone ke baad flush karo
      // ──────────────────────────────────────────────────────────────────────
      const flushIce = async (userId) => {
        const buf = iceBufRef.current[userId] || [];
        const peer = peersRef.current[userId];
        if (!peer || buf.length === 0) return;

        console.log(
          `[${userId}] Flushing ${buf.length} buffered ICE candidates`,
        );
        for (const c of buf) {
          try {
            await peer.addIceCandidate(new RTCIceCandidate(c));
          } catch (e) {
            console.error(`[${userId}] ICE flush error:`, e);
          }
        }
        // Buffer clear karo — ek baar flush ho gaya toh dobara nahi chahiye
        iceBufRef.current[userId] = [];
      };

      // ──────────────────────────────────────────────────────────────────────
      // SOCKET EVENT HANDLERS
      // ──────────────────────────────────────────────────────────────────────

      // ── handleUserJoinRtc ─────────────────────────────────────────────────
      // Kab fire hota hai: Jab koi NAYA user room mein aata hai
      // Kaun receive karta hai: EXISTING users (jo pehle se room mein hain)
      // Kya karta hai: Naye user ko offer bhejta hai
      //
      // Flow: Existing user → createOffer → setLocalDescription → offer bhejo naye user ko
      const handleUserJoinRtc = async ({ userId }) => {
        console.log("[user-join-rtc] Making offer for:", userId);

        const peer = createPeer(userId);
        peersRef.current[userId] = peer;

        // Offer create karo — isme apni capabilities (codecs, resolution, etc.) hain
        const offer = await peer.createOffer();

        // Local description set karo — yeh ICE gathering bhi start karta hai
        await peer.setLocalDescription(offer);

        console.log("[user-join-rtc] Offer sent to:", userId);
        // Server ke through naye user ko offer bhejo
        socket.emit("offer", {
          offer: peer.localDescription,
          roomcode,
          to: userId,
        });
      };

      // ── handleVideoCall ────────────────────────────────────────────────────
      // Kab fire hota hai: Jab existing user hamare liye offer bhejta hai
      // Kaun receive karta hai: NAYA user (jo abhi join kiya)
      // Kya karta hai: Offer accept karta hai, answer bhejta hai
      //
      // Flow: Offer receive → setRemoteDescription → createAnswer → setLocalDescription → answer bhejo
      const handleVideoCall = async ({ from, offer }) => {
        console.log("[videocall] Offer received from:", from);

        const peer = createPeer(from);
        peersRef.current[from] = peer;

        // Remote description set karo (offer wala)
        await peer.setRemoteDescription(new RTCSessionDescription(offer));

        // ✅ Remote description set ho gayi — ab buffered ICE candidates add kar sakte hain
        console.log("[videocall] remoteDesc set, flushing ICE...");
        await flushIce(from);

        // Answer create karo
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);

        console.log("[videocall] Answer sent to:", from);
        socket.emit("answer", { answer, to: from, roomcode });
      };

      // ── handleAnswerReceived ───────────────────────────────────────────────
      // Kab fire hota hai: Jab naya user hamaare offer ka answer deta hai
      // Kaun receive karta hai: EXISTING user (jo offer bheja tha)
      // Kya karta hai: Answer ko remote description ke roop mein set karta hai
      const handleAnswerReceived = async ({ from, answer }) => {
        console.log("[answer-received] from:", from);

        const peer = peersRef.current[from];
        if (!peer) {
          console.error("[answer-received] Peer not found for:", from);
          return;
        }

        // Answer set karo — ab dono sides ke paas ek doosre ki capabilities hain
        await peer.setRemoteDescription(new RTCSessionDescription(answer));

        // ✅ Ab ICE flush karo (answer ke baad bhi candidates aa sakte hain)
        console.log("[answer-received] remoteDesc set, flushing ICE...");
        await flushIce(from);
      };

      // ── handleIceCandidate ─────────────────────────────────────────────────
      // Kab fire hota hai: Dono side ke ICE candidates server ke through aate hain
      // Kya karta hai: Candidate seedha add karo ya buffer mein rakho
      //
      // WHY BUFFER?
      // Race condition hai: kabhi kabhi ICE candidate offer/answer se PEHLE aa jaata hai
      // (network timing issue). Remote description ke bina addIceCandidate error deta hai.
      // Solution: pehle buffer karo, remote description set hone ke baad flush karo.
      const handleIceCandidate = async ({ from, candidate }) => {
        const peer = peersRef.current[from];
        if (!peer || !candidate) return;

        if (peer.remoteDescription?.type) {
          // Remote description set hai — seedha add kar do
          try {
            await peer.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (e) {
            console.error(`[${from}] addIceCandidate error:`, e);
          }
        } else {
          // Remote description abhi set nahi hui — buffer mein rakho
          if (!iceBufRef.current[from]) iceBufRef.current[from] = [];
          iceBufRef.current[from].push(candidate);
          console.log(
            `[${from}] ICE candidate buffered (remote desc not ready)`,
          );
        }
      };

      // ── Event listeners register karo ─────────────────────────────────────
      // ZAROORI: Pehle listeners lagao, PHIR server ko ready signal do
      // Agar ulta karo toh events miss ho sakte hain (race condition)
      socket.on("user-join-rtc", handleUserJoinRtc);
      socket.on("videocall", handleVideoCall);
      socket.on("answer-received", handleAnswerReceived);
      socket.on("ice-candidate", handleIceCandidate);

      // ✅ Ab server ko batao ki hum WebRTC ke liye ready hain
      // Server yeh existing room members ko "user-join-rtc" emit karta hai
      // Isliye pehle listeners, phir yeh signal — warna offer miss ho sakta hai
      socket.emit("user-ready-rtc", { roomcode });
      console.log("[setup] Emitted user-ready-rtc ✅");

      // ── Cleanup function store karo ────────────────────────────────────────
      // Yeh tab chalega jab component unmount ho ya roomcode change ho
      cleanupRef.current = () => {
        // Sab socket listeners hataao — memory leak aur ghost events avoid karne ke liye
        socket.off("user-join-rtc", handleUserJoinRtc);
        socket.off("videocall", handleVideoCall);
        socket.off("answer-received", handleAnswerReceived);
        socket.off("ice-candidate", handleIceCandidate);

        // Sab peer connections band karo — resources free karo
        Object.values(peersRef.current).forEach((p) => p.close());
        peersRef.current = {};

        // Apni camera/mic band karo — browser mein recording indicator band hoga
        localStreamRef.current?.getTracks().forEach((t) => t.stop());
      };
    };

    setup();

    // ✅ Cleanup: component unmount hone pe ya roomcode change hone pe
    return () => {
      isMounted = false;
      cleanupRef.current?.();
    };
  }, [roomcode, getUserMediaStream]);
  // ↑ Dependencies: sirf roomcode aur getUserMediaStream
  //   In dono ke change hone pe hi effect dobara chalega

  // ─────────────────────────────────────────────────────────────────────────
  // UI Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "12px",
        padding: "16px",
      }}
    >
      {/* ── Local Video (apna camera) ────────────────────────────────────── */}
      <div>
        <p>You</p>
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted // ✅ Apni awaaz khud sunne se echo hoga — isliye muted
          style={{
            width: "300px",
            border: "2px solid blue",
            borderRadius: "8px",
            background: "#000",
          }}
        />
      </div>

      {/* ── Remote Videos (doosre users ke cameras) ─────────────────────────
          
          ✅ FLICKER FIX: Pehle yahan inline <video> tha jo har re-render pe
          unmount/remount hota tha. Ab RemoteVideo component use kar rahe hain
          jo React.memo se wrap hai — sirf tab re-render hoga jab userId change ho.
          
          remoteStreams ref pass kar rahe hain taaki RemoteVideo mount hone pe
          stream already available ho toh seedha attach kar sake.
      ─────────────────────────────────────────────────────────────────────── */}
      {remoteUserIds.map((userId) => (
        <RemoteVideo
          key={userId} // key stable hai (userId kabhi change nahi hota)
          userId={userId}
          streamRef={remoteStreams} // Ref pass kar rahe hain — yeh stable reference hai
        />
      ))}
    </div>
  );
}
