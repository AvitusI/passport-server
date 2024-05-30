import passport from "passport";
import { Strategy } from "passport-github2";
import dotenv from "dotenv";

import { GithubUser } from "../mongoose/schemas/github-user.mjs";

dotenv.config();

passport.serializeUser((user, done) => {
  console.log(`Inside serialize user`);
  console.log(user);
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const findUser = await GithubUser.findById(id);

    return findUser ? done(null, findUser) : done(null, null);
  } catch (error) {
    done(error, null);
  }
});

export default passport.use(
  new Strategy(
    {
      clientID: process.env.GithubClientId,
      clientSecret: process.env.GithubClientSecret,
      callbackURL: process.env.GithubRedirectUrl,
      scope: ["read:user"],
    },
    async (accessToken, refreshToken, profile, done) => {
      let findUser;

      try {
        findUser = await GithubUser.findOne({ githubId: profile.id });
      } catch (err) {
        return done(err, null);
      }

      try {
        if (!findUser) {
          const newUser = new GithubUser({
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
