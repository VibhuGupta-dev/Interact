import userModel from "./Auth_model.js";
import jwt from "jsonwebtoken";
import type { UserInfo } from "./Auth_model.js";
import bcrypt from "bcrypt";
import { Request, Response } from "express";

const JWT_SEC = process.env.JWT_SECRET;

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "either email and password not filled" });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "invalid email or password" });
    }
    const userpass: any = user.password;

    const passwordMatches = await bcrypt.compare(password, userpass);
    if (!passwordMatches) {
      return res.status(401).json({ message: "invalid email or password" });
    }

    if (!JWT_SEC) {
      return res.status(500).json({ message: "JWT secret is not configured" });
    }

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, role: user.role },
      JWT_SEC,
      { expiresIn: "1h" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "login success",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "error in login function" });
  }
};

export const signin = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "name , email , password any of the field is not there",
      });
    }
    const userexist = await userModel.findOne({ email: email });
    if (userexist) {
      return res.status(400).json({ message: "user exist " });
    }

    const hashedpass = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      name,
      password: hashedpass,
      email,
    });
    if (!user) {
      return res.status(400).json({ message: "user not saved" });
    }
    return res.status(201).json({ message: "user saved" });
  } catch (err) {
    return res.status(500).json({ message: "error in signin" });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({ message: "user logged out" });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ message: "error in logout" });
  }
};


export const forgotpass = async (req: Request, res: Response) => {
  try {
    const { password, confirmpass, email } = req.body;
    if (!password || !confirmpass) {
      return res
        .status(400)
        .json({ message: "both password and confirm pass is required" });
    }
    if (!email) {
      return res.status(400).json({ message: "email is required" });
    }
    if (password !== confirmpass) {
      return res.status(400).json({ message: "passwords do not match" });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    const hashedpass = await bcrypt.hash(password, 10);
    const updatepass = await userModel.findOneAndUpdate(
      { email },
      { password: hashedpass },
      { new: true }
    );
    if (!updatepass) {
      return res.status(400).json({ message: "password not updated" });
    }
    return res.status(200).json({ message: "user password updated" });
  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({ message: "error in forgotpass" });
  }
};
