
import { generateRandomLetters } from "../../utils/RoomGenerator.js";
import { Room } from "./Room_model.js";
import { Request , Response } from "express";

export const Createroom = async (req: Request, res: Response ) => {
  try {
  const roomcode = generateRandomLetters()
  console.log(roomcode)
  
  } catch (err) {
    res.status(500).json({ message: "error in login function" });
  }
};
