import { useEffect} from "react";
import socket from "../Api/ws";
import { useParams } from "react-router-dom";
import { AskName } from "./AskName";
import { useDispatch , useSelector } from "react-redux";
import { setRoomcode} from "../Redux/Features/UserSlice";

export function Chat() {

  const { roomcode } = useParams();
  const dispatch = useDispatch()
  dispatch(setRoomcode(roomcode))
  console.log(roomcode);
   

  

  useEffect(() => {
    socket.on("connection", (socket) => {
      console.log(socket);
    });
  }, []);
const room = useSelector((store) => store.User.roomcode)
const name = useSelector((store) => store.User.name)
console.log(name)
  useEffect(() => {
    
    socket.emit("get-code", { roomcode: room , name : name});
  }, []);


  return (<>

    <div className="">chat</div>   
  
  </>)
}
