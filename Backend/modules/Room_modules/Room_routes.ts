import { Router }  from "express";
import express from "express"
import { Createroom } from "./Room_controller.js";
import authMiddleware from "../../middleware/IsuserLoggedIn.js";
const router = express.Router()
console.log("hey")
router.post("/api/createroom" , Createroom)

export default router
