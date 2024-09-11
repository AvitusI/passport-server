import passport from "passport";
import { Strategy } from "passport-github2";
import dotenv from "dotenv";

import { GitHubUser } from "../mongoose/schemas/users.mjs";

dotenv.config();

export default passport.use(
  new Strategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_REDIRECT_URL,
      scope: ["read:user"],
    },
    async (accessToken, refreshToken, profile, done) => {
      let findUser;

      try {
        findUser = await GitHubUser.findOne({ githubId: profile.id });
      } catch (err) {
        return done(err, null);
      }

      try {
        if (!findUser) {
          const newUser = new GitHubUser({
            username: profile.username,
            githubId: profile.id,
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
