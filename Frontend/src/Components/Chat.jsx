import { useEffect } from "react";
import socket from "../Api/ws";
import { useParams } from "react-router-dom";
export function Chat() {
  const { roomcode } = useParams();
  console.log(roomcode);

  useEffect(() => {
    socket.on("connection", (socket) => {
      console.log(socket);
    });
  }, []);

  useEffect(() => {
    socket.emit("get-code", { roomcode: roomcode });
  }, []);


  return (<>
  chat
  </>)
}
