import passport from "passport";
import { Strategy } from "passport-local";

import { LocalUser, User } from "../mongoose/schemas/users.mjs";
import { hashPassword } from "../utils/helpers.mjs";

passport.serializeUser((user, done) => {
  // Store user in session
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const foundedUser = await User.findById(id).select("-password");
    done(null, foundedUser);
  } catch (error) {
    done(error, null);
  }
});

export default passport.use(
  "local-signup",
  new Strategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (request, email, password, done) => {
      const { username } = request.body;

      if (!username || !email || !password) {
        done(new Error("all credentials are required"), null);
      }

      const userByEmail = await User.findOne({ email });

      if (userByEmail) {
        done(new Error("email already exist"), null);
      }

      const hashedPassword = hashPassword(password);

      const newUser = new LocalUser({
        username,
        email,
        password: hashedPassword,
      });

      try {
        const savedUser = await newUser.save();

        done(null, savedUser);
      } catch (error) {
        done(error, null);
      }
    }
  )
);
