import passport from "passport";
import { Strategy } from "passport-google-oauth20";
import dotenv from "dotenv";

import { GoogleUser } from "../mongoose/schemas/google-user.mjs";

dotenv.config();

passport.serializeUser((user, done) => {
  console.log(`Inside serialize user`);
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const findUser = await GoogleUser.findById(id);

    return findUser ? done(null, findUser) : done(null, null);
  } catch (err) {
    done(err, null);
  }
});

export default passport.use(
  new Strategy(
    {
      clientID: process.env.GoogleClientId,
      clientSecret: process.env.GoogleClientSecret,
      callbackURL: process.env.GoogleRedirectUrl,
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      let findUser;

      try {
        findUser = await GoogleUser.findOne({ googleId: profile.id });
      } catch (err) {
        return done(err, null);
      }

      try {
        if (!findUser) {
          const newUser = new GoogleUser({
            username: profile.displayName,
            googleId: profile.id,
            avatar: profile.photos[0].value,
          });

          const newSavedUser = await newUser.save();
          return done(null, newSavedUser);
        }
        return done(null, findUser);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);
