import passport from "passport";
import { Strategy } from "passport-local";
import bcrypt from "bcrypt";

import { User, LocalUser } from "../mongoose/schemas/users.mjs";
import { Token } from "../mongoose/schemas/token.mjs";
import { sendEmail } from "../utils/email/sendEmail.mjs";

// THESE SERIALIZER AND DESERIALIZER ARE SHARED BY ALL STRATEGIES
passport.serializeUser((user, done) => {
  // Store user in session
  // Inside shared serializer
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const foundedUser = await User.findById(id)
      .select("-password")
      .populate("followers");
    console.log(`Inside shared deserializer`);
    done(null, foundedUser);
  } catch (error) {
    done(error, null);
  }
});

/* TRY THIS LATER
passport.deserializeUser(async ({ id, strategy }, done) => {
  console.log("Inside general deserializer");
  try {
    let user;
    switch (strategy) {
      case "LocalUser":
        console.log(`Key id: ${id}`);
        user = await User.findById(id)
          .select("-password")
          .populate("followers");
        break;
      case "GoogleUser":
        user = await User.findById(id).populate("followers");
        break;
      case "GitHubUser":
        user = await User.findById(id).populate("followers");
        break;
      case "DiscordUser":
        console.log(` Key: ${key.id}`);
        user = await User.findById(id).populate("followers");
        break;
    }
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
*/

export default passport.use(
  "local-signup",
  new Strategy(
    {
      usernameField: "userId",
      passwordField: "token",
      passReqToCallback: true,
    },
    async (request, userId, token, done) => {
      //const { userId, token } = request.body;
      console.log(request.body);

      if (!userId || !token) {
        done(new Error("userId and token required"), null);
      }

      try {
        let accountActivateToken = await Token.findOne({
          userId,
          type: "ActivateAccountToken",
        });

        if (!accountActivateToken) {
          done(new Error("Invalid or expired password reset token"), null);
        }

        const isValid = await bcrypt.compare(token, accountActivateToken.token);

        if (!isValid) {
          done(new Error("Invalid or expired password reset token"), null);
        }

        const activatedUser = await LocalUser.findByIdAndUpdate(
          userId,
          { active: true },
          { new: true }
        );

        if (!activatedUser) {
          return done(new Error("User not found"), null);
        }

        sendEmail(
          activatedUser.email,
          "Account Activated Successfully",
          {
            name: activatedUser.username,
          },
          "welcome.handlebars"
        );

        await accountActivateToken.deleteOne();

        console.log(activatedUser);

        done(null, activatedUser);
      } catch (error) {
        console.error(error);
        done(error, null);
      }
    }
  )
);
