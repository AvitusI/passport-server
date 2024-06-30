import passport from "passport";
import { Strategy } from "passport-local";

import { User } from "../mongoose/schemas/users.mjs";
import { comparePassword } from "../utils/helpers.mjs";

/*
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

*/

export default passport.use(
  new Strategy(
    {
      usernameField: "email",
    },
    async (email, password, done) => {
      try {
        if (!email || !password) {
          throw new Error("Email and password are required");
        }
        const findUser = await User.findOne({ email });
        if (!findUser) throw new Error("User not found");

        if (!comparePassword(password, findUser.password))
          throw new Error("Bad credentials");

        done(null, findUser);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

// On authentication, serializeUser is called once. On subsequent requests, passport will call deserialize user
