import mongoose from "mongoose";

const GoogleUserSchema = new mongoose.Schema({
  username: {
    type: mongoose.Schema.Types.String,
    required: true,
    unique: true,
  },

  googleId: {
    type: mongoose.Schema.Types.String,
    required: true,
    unique: true,
  },

  avatar: {
    type: mongoose.Schema.Types.String,
  },
});

export const GoogleUser = mongoose.model("GoogleUser", GoogleUserSchema);
