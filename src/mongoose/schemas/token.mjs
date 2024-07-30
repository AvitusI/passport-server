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

const ActivateAccountTokenSchema = new mongoose.Schema({});

export const ActivateAccountToken = Token.discriminator(
  "ActivateAccountToken",
  ActivateAccountTokenSchema
);

ActivateAccountTokenSchema.post("remove", async function (doc) {
  try {
    const user = await mongoose.model("User").findById(doc.userId);

    // Check if the user exists and is not activated
    if (user && !user.active) {
      await user.deleteOne();
      console.log(`Unactivated user with ID ${doc.userId} deleted.`);
    }
  } catch (err) {
    console.error(`Error deleting the user with ID ${doc.userId}: `, err);
  }
});

const ResetPasswordTokenSchema = new mongoose.Schema({});

export const ResetPasswordToken = Token.discriminator(
  "ResetPasswordToken",
  ResetPasswordTokenSchema
);
