import { generateRandomLetters } from "../../utils/RoomGenerator.js";
import userModel from "../Auth_modules/Auth_model.js";
import { Room } from "./Room_model.js";
import { Request, Response } from "express";
import cron from "node-cron";
import { redis, subscriber } from "../../app.js";

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
    console.log("hey");
    const { roomcode } = req.body;
    console.log(roomcode);
    if (!roomcode) {
      return res.status(400).json({ message: "roomcode is required" });
    }

    const findroom = await Room.findOne({ roomcode: roomcode });
    if (!findroom) {
      return res.status(400).json({ message: "room not found " });
    }

    return res.status(201).json({ message: "room found" });
  } catch (err) {
    return res.status(500).json({ message: "error in get room" });
  }
};

export const checkownerroom = async (req: Request, res: Response) => {
  try {
    console.log("hey");
    const userid = req.user.id;
    if (!userid) {
      return res.status(400).json({ message: " userid not found" });
    }

    const { roomcode } = req.body;
    console.log(roomcode);
    if (!roomcode) {
      return res.status(400).json({ message: "roomcode not enter" });
    }

    const findroom = await Room.findOne({ roomcode: roomcode });
    console.log(findroom);
    if (!findroom) {
      return res.status(400).json({ message: " room code not found" });
    }

    const roomowner = findroom.host;
    console.log(roomowner);
    if (roomowner == userid) {
      return res
        .status(201)
        .json({ message: "owner of the room wants to join the meeting" });
    }
  } catch (err) {
    return res.status(500).json({ message: "error in check room room" });
  }
};




const flushToDB = async (roomcode: string) => {
  const dataKey = `room:${roomcode}:messages`;
  const ttlKey  = `room:${roomcode}:messages:ttl`;

  const messages = await redis.lrange(dataKey, 0, -1);
  if (messages.length === 0) return;

  const parsedMessages = messages.map((m: string) => JSON.parse(m));

  await Room.findOneAndUpdate(
    { roomcode },
    { $push: { chat: { $each: parsedMessages } } }
  );

  await redis.del(dataKey);
  await redis.del(ttlKey);

  console.log(`✅ Flushed ${parsedMessages.length} msgs for room ${roomcode}`);
};




const startSubscriber = async () => {
  await redis.config("SET", "notify-keyspace-events", "Ex");

  // ✅ ioredis mein callback wala subscribe nahi hota
  // pehle on("message") lagao, phir subscribe karo
  subscriber.on("message", (channel: string, expiredKey: string) => {
    if (!expiredKey || !expiredKey.endsWith(":messages:ttl")) return;

    const parts = expiredKey.split(":");
    const roomcode = parts[1];
    if (!roomcode) return;

    console.log(`⏰ TTL expired for room ${roomcode}`);
    flushToDB(roomcode);
  });

  await subscriber.subscribe("__keyevent@0__:expired");
};

const startCron = () => {
  cron.schedule("*/30 * * * *", async () => {
    console.log("🔄 Cron running...");
    
    const keys = await redis.keys("room:*:messages");
    
    for (const key of keys) {
      if (key.endsWith(":ttl")) continue;

      const roomcode = key.split(":")[1];
      const ttlKey = `room:${roomcode}:messages:ttl`;
      
      const ttlExists = await redis.exists(ttlKey);
      if (!ttlExists) {
        console.log(`🛡️ Cron catching missed flush for room ${roomcode}`);
        await flushToDB(roomcode);
      }
    }
  });
};


export const initChatServices = async () => {
  await startSubscriber();
  startCron();
  console.log("✅ Chat services initialized");
};

export const storechat = async (req: Request, res: Response) => {
  try {
    const { chat, name, userId, role } = req.body;
    const roomcode = req.params.roomcode;

    const dataKey = `room:${roomcode}:messages`;
    const ttlKey  = `room:${roomcode}:messages:ttl`;

    const message = { chat, name, userId, role, time: new Date() };

    await redis.rpush(dataKey, JSON.stringify(message));
    
    
    await redis.set(ttlKey, "1", "EX", 60 * 60 * 2);

    const length = await redis.llen(dataKey);
    if (length > 50) {
      await flushToDB(roomcode);
    }

    return res.status(200).json({ message: "chat stored" });

  } catch (err) {
    return res.status(500).json({ message: "error in store chat" });
  }
};


export const getchat = async (req: Request, res: Response) => {
  try {
    const roomcode = req.params.roomcode;
    if (!roomcode) {
      return res.status(400).json({ message: "no room code" });
    }

    const dataKey = `room:${roomcode}:messages`;
    const cacheExists = await redis.exists(dataKey);

    if (cacheExists) {
     
      const cachedMessages = await redis.lrange(dataKey, 0, -1);
      const parsed = cachedMessages.map((m: string) => JSON.parse(m));
      return res.status(200).json({ chat: parsed });
    }

    const findchat = await Room.findOne({ roomcode }).select("chat");
    if (!findchat) {
      return res.status(400).json({ message: "no chat found" });
    }

    return res.status(200).json({ chat: findchat.chat });

  } catch (err) {
    return res.status(500).json({ message: "error in getchat" });
  }
};