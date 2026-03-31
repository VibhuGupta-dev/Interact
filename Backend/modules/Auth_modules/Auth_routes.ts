import express from "express";
import { login, logout, signin, forgotpass , getuser } from "./Auth_controller.js";
import authMiddleware from "../../middleware/IsuserLoggedIn.js";

const router = express.Router();

router.post("/api/login", login);
router.post("/api/signup", signin);
router.post("/api/logout", logout);
router.post("/api/forgotpass", forgotpass);
router.get("/api/me" , authMiddleware , getuser)
export default router;