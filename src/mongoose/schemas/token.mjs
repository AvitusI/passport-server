import mongoose from "mongoose";

const baseTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    token: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 3600,
    },
  },
  {
    discriminatorKey: "type",
    collection: "tokens",
  }
);

export const Token = mongoose.model("Token", baseTokenSchema);

export const ActivateAccountToken = Token.discriminator(
  "ActivateAccountToken",
  new mongoose.Schema({})
);

export const ResetPasswordToken = Token.discriminator(
  "ResetPasswordToken",
  new mongoose.Schema({})
);
