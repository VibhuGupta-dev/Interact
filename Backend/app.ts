import dotenv from "dotenv";
dotenv.config(); 
import express from "express";
import cors from "cors";
import { mongoconnect } from "./config/Mongoose-connect.js";
import authRoutes from "./modules/Auth_modules/Auth_routes.js";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import http from "http"
import { socketcontroller } from "./socket/Socket_controller.js";
import roomrouter from "./modules/Room_modules/Room_routes.js"


const app = express();
const CLIENT_URI = process.env.CLIENT_URI

export const server = http.createServer(app); 

export const io : any= new Server(server, {
  cors: {
    origin: "*", 
    credentials : true
  }
});
app.use(cors({
  origin : CLIENT_URI,
  credentials : true
}))

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

mongoconnect();
socketcontroller(io)



app.get("/", (req, res) => {
  res.send("Chat backend running");
});
app.use("/auth", authRoutes);
app.use("/room" , roomrouter)

export default app;



