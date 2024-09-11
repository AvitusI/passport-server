import passport from "passport";
import { Strategy } from "passport-google-oauth20";
import dotenv from "dotenv";

import { GoogleUser } from "../mongoose/schemas/users.mjs";

dotenv.config();

export default passport.use(
  new Strategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT_URL,
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
