import passport from "passport";

import { User } from "../mongoose/schemas/users.mjs";
import { GoogleUser } from "../mongoose/schemas/users.mjs";
import { GitHubUser } from "../mongoose/schemas/users.mjs";
import { DiscordUser } from "../mongoose/schemas/users.mjs";

// Unified serializeUser
passport.serializeUser((user, done) => {
  // Store both the user ID and the strategy in the session
  done(null, { id: user, strategy: user.strategy });
});

// Unified deserializeUser
passport.deserializeUser(async (key, done) => {
  try {
    let user;
    switch (key.strategy) {
      case "LocalUser":
        user = await User.findById(key.id).select("-password -strategy");
        break;
      case "GoogleUser":
        user = await GoogleUser.findById(key.id).select("-strategy");
        break;
      case "GitHubUser":
        user = await GitHubUser.findById(key.id).select("-strategy");
        break;
      case "DiscordUser":
        user = await DiscordUser.findById(key.id).select("-strategy");
        break;
      default:
        return done(new Error("No strategy found"), null);
    }
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
