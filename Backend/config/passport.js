import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from "dotenv";
import userModel from "../modules/Auth_modules/Auth_model.ts"; // Sahi path check kar lena

dotenv.config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/auth/google/callback",
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // 1. Check karo ki user pehle se hai ya nahi
      let user = await userModel.findOne({ email: profile.emails[0].value });

      if (user) {
        // Agar user pehle se hai, toh usme googleId update kar do (agar nahi hai toh)
        if (!user.googleId) {
          user.googleId = profile.id;
          await user.save();
        }
        return done(null, user);
      } else {
        // 2. Naya user banao (Required fields ka dhyan rakhte hue)
        const newUser = await userModel.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
          image: profile.photos[0]?.value,
          role: "User"
          // Password yahan pass nahi karenge, validation error nahi aayega ab
        });
        return done(null, newUser);
      }
    } catch (err) {
      console.error("Error in Passport Callback:", err);
      return done(err, null);
    }
  }
));

// Session handling
passport.serializeUser((user, done) => {
  done(null, user.id); // MongoDB ki _id session mein jayegi
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await userModel.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});