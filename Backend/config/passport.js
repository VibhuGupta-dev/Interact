import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from "dotenv";

dotenv.config(); // ✅ Sabse pehle load karo

import userModel from "../modules/Auth_modules/Auth_model.js";

const SERVER_URI = process.env.SERVER_URI;

passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${SERVER_URI}/auth/google/callback`,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // 1. Check karo ki user pehle se hai ya nahi
      let user = await userModel.findOne({ email: profile.emails[0].value });

      if (user) {
        // Agar user pehle se hai, googleId update karo agar missing hai
        if (!user.googleId) {
          user.googleId = profile.id;
          await user.save();
        }
        return done(null, user);
      } else {
        // 2. Naya user banao
        const newUser = await userModel.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
          image: profile.photos?.[0]?.value || "",
          role: "User",
        });
        return done(null, newUser);
      }
    } catch (err) {
      console.error("Error in Passport Google Callback:", err);
      return done(err, null);
    }
  }
));

// Session handling
passport.serializeUser((user, done) => {
  done(null, user.id); // MongoDB _id session mein store hogi
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await userModel.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;