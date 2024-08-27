import crypto from "crypto";
import bcrypt from "bcrypt";

import { Token, ResetPasswordToken } from "../mongoose/schemas/token.mjs";
import { User, LocalUser } from "../mongoose/schemas/users.mjs";
import { sendEmail } from "../utils/email/sendEmail.mjs";

export const requestPasswordReset = async (email) => {
  try {
    const user = await User.findOne({ email });

    if (!user) throw new Error("User does not exist");

    let token = await Token.findOne({
      userId: user._id,
      type: "ResetPasswordToken",
    });

    if (token) await token.deleteOne();

    let resetToken = crypto.randomBytes(32).toString("hex");

    const hash = await bcrypt.hash(resetToken, Number(process.env.BCRYPT_SALT));

    await new ResetPasswordToken({
      userId: user._id,
      token: hash,
      createdAt: Date.now(),
    }).save();

    const link = `http://localhost:3000/resetPassword?token=${resetToken}&id=${user._id}`;

    sendEmail(
      user.email,
      "Password Reset Request",
      { name: user.username, link: link },
      "requestResetPassword.handlebars"
    );

    return { link };
  } catch (error) {
    console.error(error);
    throw new Error("An error occurred");
  }
};

export const resetPassword = async (userId, token, password) => {
  try {
    let passwordResetToken = await Token.findOne({
      userId,
      type: "ResetPasswordToken",
    });

    if (!passwordResetToken) {
      throw new Error("Invalid or expired password reset token");
    }

    const isValid = await bcrypt.compare(token, passwordResetToken.token);

    if (!isValid) {
      throw new Error("Invalid or expired password reset token");
    }

    const hash = await bcrypt.hash(password, Number(process.env.BCRYPT_SALT));

    await LocalUser.findByIdAndUpdate(
      userId,
      { $set: { password: hash } },
      { new: true, runValidators: true }
    );

    const user = await User.findById(userId);

    sendEmail(
      user.email,
      "Password Reset Successful",
      {
        name: user.username,
      },
      "resetPassword.handlebars"
    );

    await passwordResetToken.deleteOne();

    return { message: "Password reset was successful" };
  } catch (err) {
    console.error(err);
    throw new Error("An error occurred");
  }
};
