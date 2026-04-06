import { generateRandomLetters } from "../../utils/RoomGenerator.js";
import userModel from "../Auth_modules/Auth_model.js";
import { Room } from "./Room_model.js";
import { Request, Response } from "express";

export const Createroom = async (req: Request, res: Response) => {
  try {
    const roomcode = await generateRandomLetters();

    const userId = req.user.id;

    const user = await userModel.findById(userId).select("-password -__v"); // ✅ findById
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const room = await Room.create({
      roomcode,
      host: user._id,
   
    });

    return res.status(201).json(room);
  } catch (err) {
    console.error("Createroom error:", err);
    return res.status(500).json({ message: "Error creating room" });
  }
};

export const getroom = async (req: Request, res: Response) => {
  try {
    console.log("hey")
    const  {roomcode}  = req.body;
    console.log(roomcode)
    if (!roomcode) {
      return res.status(400).json({ message: "roomcode is required" });
    }

    const findroom = await Room.findOne({ roomcode: roomcode });
    if (!findroom) {
      return res.status(400).json({ message: "room not found " });
    }

    return res.status(201).json({ message: "room found"});
  } catch (err) {
    return res.status(500).json({ message: "error in get room" });
  }
};

export const checkownerroom = async (req : Request , res : Response) => {
  try {
    console.log("hey")
      const userid =req.user.id
      if(!userid) {
        return res.status(400).json({message : " userid not found"})
      }
      
      const {roomcode} = req.body
      console.log(roomcode)
      if(!roomcode) {
        return res.status(400).json({message : "roomcode not enter"})
      }

      const findroom = await Room.findOne({roomcode : roomcode})
      console.log(findroom)
      if(!findroom) {
        return res.status(400).json({message :  " room code not found"})
      }

      const roomowner = findroom.host
      console.log(roomowner)
      if(roomowner == userid){
        return res.status(201).json({message : "owner of the room wants to join the meeting"})
      }

     
  }catch(err) {
return res.status(500).json({ message: "error in check room room" });
  }
}
