import { io } from "socket.io-client";

const backendurl = import.meta.env.VITE_BACKEND_URI
console.log(backendurl)
const socket = io(backendurl, {
    withCredentials: true
});

export default socket;