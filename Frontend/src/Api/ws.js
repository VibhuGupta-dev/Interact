import { io } from "socket.io-client";

const backendurl = import.meta.env.VITE_BACKEND_URI;
let socketInstance = null;

export function createSocket() {
  if (!socketInstance) {
    socketInstance = io(backendurl, {
      withCredentials: true,
      reconnection: false,
    });
  }
  return socketInstance;
}

export function getSocket() {
  return socketInstance;
}

export function destroySocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}