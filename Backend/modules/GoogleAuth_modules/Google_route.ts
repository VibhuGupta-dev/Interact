import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

const router = express.Router();

// ─── Google OAuth Initiation ───────────────────────────────────────────────
router.get("/auth/google", (req, res, next) => {
  try {
    passport.authenticate("google", { scope: ["profile", "email"] })(
      req,
      res,
      next,
    );
  } catch (err) {
    next(err);
  }
});

// ─── Google OAuth Callback ─────────────────────────────────────────────────
router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  (req, res, next) => {
    try {
      const jwtsec = process.env.JWT_SECRET;

      if (!jwtsec) {
        throw new Error("JWT_SECRET is not defined in environment variables");
      }

      if (!req.user) {
        res
          .status(401)
          .json({ success: false, message: "Authentication failed" });
        return;
      }

      const user = req.user as any;

      if (!user._id || !user.email) {
        throw new Error(
          "User object is missing required fields (_id or email)",
        );
      }

      const token = jwt.sign({ id: user._id, email: user.email }, jwtsec, {
        expiresIn: "7d",
      });

      const clientUri = process.env.CLIENT_URI;
      if (!clientUri) {
        throw new Error("CLIENT_URI is not defined in environment variables");
      }

      
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, 
      });

      res.redirect(`${clientUri}/`);
    } catch (err) {
      next(err);
    }
  },
);

// ─── Check Login Success ───────────────────────────────────────────────────
router.get("/auth/login/success", (req, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not Authorized" });
      return;
    }

    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (err) {
    next(err);
  }
});

// ─── Logout ────────────────────────────────────────────────────────────────
router.get("/auth/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    const redirectUrl = process.env.CLIENT_URI
      ? `${process.env.CLIENT_URI}/login`
      : "http://localhost:5173/login";

    res.redirect(redirectUrl);
  });
});

export default router;
