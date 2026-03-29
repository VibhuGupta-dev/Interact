import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const JWT_SEC = process.env.JWT_SECRET 
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }


    const decoded = jwt.verify(token, JWT_SEC as string);
 
    req.user = decoded; 
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    
};
}
export default authMiddleware;