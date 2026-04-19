import passport from "passport";
import {
  Strategy as GoogleStrategy,
  Profile,
  VerifyCallback,
} from "passport-google-oauth20";
import dotenv from "dotenv";
import userModel, { UserInfo } from "../modules/Auth_modules/Auth_model.js";

dotenv.config();

const SERVER_URI = process.env.SERVER_URI;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: `${SERVER_URI}/auth/google/callback`,
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: VerifyCallback
    ) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error("No email found in Google profile"), undefined);
        }

        // 1. Check karo ki user pehle se hai ya nahi
        let user = await userModel.findOne({ email });

        if (user) {
          // GoogleId update karo agar missing hai
          if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
          }
          return done(null, user);
        } else {
          // 2. Naya user banao
          const newUser = await userModel.create({
            name: profile.displayName,
            email,
            googleId: profile.id,
            image: profile.photos?.[0]?.value || "",
            role: "User",
          });
          return done(null, newUser);
        }
      } catch (err) {
        console.error("Error in Passport Google Callback:", err);
        return done(err as Error, undefined);
      }
    }
  )
);

// Session handling
passport.serializeUser((user, done) => {
  const u = user as UserInfo;
  done(null, u._id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await userModel.findById(id);
    done(null, user);
  } catch (err) {
    done(err as Error, null);
  }
});

export default passport;