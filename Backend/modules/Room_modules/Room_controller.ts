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
      participants: [{ user: user._id }],
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
