import passport from "passport";
import { Strategy } from "passport-local";

import { User } from "../mongoose/schemas/user.mjs";
import { comparePassword } from "../utils/helpers.mjs";

// Write to the session data
//  Tells passport how to serialize user data into the session(here, to strore user id to session data)
passport.serializeUser((user, done) => {
  console.log(`Inside serialize user`);
  console.log(user);
  done(null, user.id);
});

// Seek from session data and use that to fetch from the database
// Also stores the user data(here, id) into the request object itself
passport.deserializeUser(async (id, done) => {
  try {
    console.log("calling deserialize user");

    const findUser = await User.findById(id);

    if (!findUser) throw new Error("User not found");

    done(null, findUser);
  } catch (error) {
    done(error, null);
  }
});

export default passport.use(
  new Strategy(async (username, password, done) => {
    try {
      const findUser = await User.findOne({ username });
      if (!findUser) throw new Error("User not found");

      if (comparePassword(password, findUser.password))
        throw new Error("Bad credentials");

      done(null, findUser);
    } catch (error) {
      done(error, null);
    }
  })
);

// On authentication, serializeUser is called once. On subsequent requests, passport will call deserialize user
