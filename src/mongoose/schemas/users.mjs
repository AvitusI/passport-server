import mongoose from "mongoose";

const baseUserSchema = new mongoose.Schema(
  {
    avatar: {
      type: String,
      required: true,
      default:
        "https://res.cloudinary.com/dlpbfst4n/image/upload/v1709551620/cld-sample-2.jpg",
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    bookmarks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    bio: {
      type: String,
    },
  },
  {
    discriminatorKey: "strategy",
    collection: "users",
  }
);

export const User = mongoose.model("User", baseUserSchema);

export const LocalUser = User.discriminator(
  "LocalUser",
  new mongoose.Schema({
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      required: true,
      default: false,
    },
  })
);

export const GoogleUser = User.discriminator(
  "GoogleUser",
  new mongoose.Schema({
    googleId: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
    },
  })
);

export const GitHubUser = User.discriminator(
  "GitHubUser",
  new mongoose.Schema({
    githubId: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
    },
  })
);

export const DiscordUser = User.discriminator(
  "DiscordUser",
  new mongoose.Schema({
    discordId: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
    },
  })
);
