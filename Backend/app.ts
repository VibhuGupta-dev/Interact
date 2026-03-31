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
import session from "express-session"
import passport from "passport"
import jwt from "jsonwebtoken";
import googleroutes from "./modules/GoogleAuth_modules/Google_route.js"
import "./config/passport.js"; 


const app = express();
const CLIENT_URI = process.env.CLIENT_URI

export const server = http.createServer(app); 

export const io : any= new Server(server, {
  cors: {
    origin: CLIENT_URI, 
    credentials : true
  }
});
app.use(cors({
  origin: "http://localhost:5173", 
  methods: "GET,POST,PUT,DELETE",
  credentials: true, 
}));


app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'secret_key_kuch_bhi_daal_do',
  resave: false,
  saveUninitialized: false, 
  cookie: { 
    secure: false, 
    maxAge: 24 * 60 * 60 * 1000 
  }
}));

app.use(passport.initialize());
app.use(passport.session()); 
mongoconnect();
socketcontroller(io)


const jwtsec : any = process.env.JWT_SECRET
console.log(jwtsec)

app.get("/", (req, res) => {
  res.send("Chat backend running");
});

app.use("/" , googleroutes)
app.use("/auth", authRoutes);
app.use("/room" , roomrouter)

export default app;



