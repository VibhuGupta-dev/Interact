
import express from "express";
import { login, logout, signin, forgotpass } from "./Auth_controller.js";

const router = express.Router();

router.post("/login", login);
router.post("/signin", signin);
router.post("/logout", logout);
router.post("/forgotpass", forgotpass);

export default router;