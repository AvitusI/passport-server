import passport from "passport";
import { Strategy } from "passport-local";

import { User } from "../mongoose/schemas/users.mjs";
import { comparePassword } from "../utils/helpers.mjs";

// THESE ARE NOT CALLED, THE SIGNUP'S SERIALIZER AND DESERIALIZER ARE THE ONES CALLED
/*
passport.serializeUser((user, done) => {
  // Store both the user ID and the strategy in the session
  console.log(user);
  done(null, user._id);
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

*/

export default passport.use(
  new Strategy(
    {
      usernameField: "email",
    },
    async (email, pwd, done) => {
      try {
        if (!email || !pwd) {
          throw new Error("Email and password are required");
        }
        const findUser = await User.findOne({ email, active: true });
        if (!findUser) {
          throw new Error("User not found");
        }

        if (!comparePassword(pwd, findUser.password))
          throw new Error("Bad credentials");

        // let's get rid of the password
        const { password, ...safeUser } = findUser.toObject();
        return done(null, safeUser);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// On authentication, serializeUser is called once. On subsequent requests, passport will call deserialize user
