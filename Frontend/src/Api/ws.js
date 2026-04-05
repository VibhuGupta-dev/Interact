// services/socketService.js
import { io } from "socket.io-client";

const backendurl = import.meta.env.VITE_BACKEND_URI;

export function createSocket() {
  return io(backendurl, {
    withCredentials: true,
    reconnection: false, // ✅ Auto-reconnect band karo
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5
  });
}