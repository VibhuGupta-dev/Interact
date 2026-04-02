import { io } from "../app.js";
import { Socket } from "socket.io";

export function socketcontroller (io : any)  {
  try {
    console.log("socket setup");
    io.on("connection", (socket : any) => {
      console.log("USER CONNECTED:", socket.id);
      
      socket.on("get-code" , (data : any) => {
        console.log(data)
        socket.Roomcode = data.roomcode 
        socket.name = data.name
        console.log(socket)
      
       

      })
    });

  } catch (err) {
    console.log("err in socket controller")
  }
};
