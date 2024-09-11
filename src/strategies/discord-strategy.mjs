import passport from "passport";
import { Strategy } from "passport-discord";
import dotenv from "dotenv";

import { DiscordUser } from "../mongoose/schemas/users.mjs";

dotenv.config();

export default passport.use(
  new Strategy(
    {
      clientID: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackURL: process.env.DISCORD_REDIRECT_URL,
      scope: ["identify"],
    },
    async (accessToken, refreshToken, profile, done) => {
      let findUser;
      try {
        findUser = await DiscordUser.findOne({ discordId: profile.id });
      } catch (err) {
        return done(err, null);
      }

      try {
        if (!findUser) {
          const newUser = new DiscordUser({
            username: profile.username,
            discordId: profile.id,
            avatar: `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`,
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
