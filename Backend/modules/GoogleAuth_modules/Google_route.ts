import express, { Request, Response, NextFunction } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

const router = express.Router();

// ─── Google OAuth Initiation ──────────────────────────────────────────────
router.get(
  "/auth/google",
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("google", {
      scope: ["profile", "email"],
      session: false,
    })(req, res, next);
  }
);

// ─── Google OAuth Callback ────────────────────────────────────────────────
router.get(
  "/auth/google/callback",
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      "google",
      { session: false, failureRedirect: `${process.env.CLIENT_URI}/login?error=oauth_failed` },
      (err: Error | null, user: any) => {
        try {
          if (err || !user) {
            console.error("Google Auth Error:", err);
            return res.redirect(
              `${process.env.CLIENT_URI}/login?error=auth_failed`
            );
          }

          const jwtsec = process.env.JWT_SECRET;
          const clientUri = process.env.CLIENT_URI;

          if (!jwtsec || !clientUri) {
            console.error("Missing env vars: JWT_SECRET or CLIENT_URI");
            return res.redirect(`${clientUri}/login?error=server_error`);
          }

          if (!user._id || !user.email) {
            return res.redirect(`${clientUri}/login?error=invalid_user`);
          }

          const token = jwt.sign(
            {
              id: user._id.toString(),
              email: user.email,
              role: user.role,
            },
            jwtsec,
            { expiresIn: "7d" }
          );

          // ✅ Token URL mein bhejo — cross domain ke liye
          return res.redirect(`${clientUri}/?token=${token}`);
        } catch (error) {
          console.error("Callback handler error:", error);
          return res.redirect(
            `${process.env.CLIENT_URI}/login?error=server_error`
          );
        }
      }
    )(req, res, next);
  }
);

// ─── Check Login Status ───────────────────────────────────────────────────
router.get(
  "/auth/login/success",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: "Not Authorized" });
        return;
      }
      res.status(200).json({ success: true, user: req.user });
    } catch (err) {
      next(err);
    }
  }
);

// ─── Logout ───────────────────────────────────────────────────────────────
router.get(
  "/auth/logout",
  (req: Request, res: Response, next: NextFunction) => {
    req.logout((err) => {
      if (err) return next(err);
      const redirectUrl = process.env.CLIENT_URI
        ? `${process.env.CLIENT_URI}/login`
        : "http://localhost:5173/login";
      res.redirect(redirectUrl);
    });
  }
);

export default router;