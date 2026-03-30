import { error } from "console";
import { io } from "../app.js";
import { Socket } from "socket.io";
import { generateRandomLetters } from "../utils/RoomGenerator.js";

export function socketcontroller (io : any)  {
  try {
    console.log("socket setup");
    io.on("connection", (socket : any) => {
      console.log("USER CONNECTED:", socket.id);
      
      socket.emit("create-instant-meeting" , (data : any) => {
        console.log(data)
        const roomcode = generateRandomLetters()

      })
    });

  } catch (err) {
    console.log("err in socket controller")
  }
};
