//  THIS FILE IS NOT CALLED AT ALL.

import passport from "passport";

import { LocalUser } from "../mongoose/schemas/users.mjs";
import { GoogleUser } from "../mongoose/schemas/users.mjs";
import { GitHubUser } from "../mongoose/schemas/users.mjs";
import { DiscordUser } from "../mongoose/schemas/users.mjs";

// Unified serializeUser
passport.serializeUser((user, done) => {
  // Store both the user ID and the strategy in the session
  console.log(user);
  done(null, user._id);
});
// done(null, { id: user.id, strategy: user.strategy });

// Unified deserializeUser
/*
passport.deserializeUser(async (key, done) => {
  try {
    let user;
    switch (key.strategy) {
      case "LocalUser":
        console.log(`Key id: ${key.id}`);
        user = await LocalUser.findById(key.id).populate("followers");
        break;
      case "GoogleUser":
        user = await GoogleUser.findById(key.id).select("-strategy");
        break;
      case "GitHubUser":
        user = await GitHubUser.findById(key.id).select("-strategy");
        break;
      case "DiscordUser":
        console.log(` Key: ${key.id}`);
        user = await DiscordUser.findById(key.id).select("-strategy");
        break;
      default:
        return done(new Error("No strategy found"), null);
    }
    done(null, user);
  } catch (err) {
    done(err, null);
  }
}); */

export default passport;
