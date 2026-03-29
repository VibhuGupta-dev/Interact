import dotenv from "dotenv";
dotenv.config(); 
import express from "express";
import cors from "cors";
import { mongoconnect } from "./config/Mongoose-connect.js";
import authRoutes from "./modules/Auth_modules/Auth_routes.js";
import cookieParser from "cookie-parser";
const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }));

mongoconnect();

app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Chat backend running ");
});

export default app;