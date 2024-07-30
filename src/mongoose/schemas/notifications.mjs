import mongoose from "mongoose";

const notificationOptions = {
  discriminatorKey: "type",
  collection: "notifications",
};

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  notificationOptions
);

// Base notification model
export const Notification = mongoose.model("Notification", notificationSchema);

// Derived Schemas for different notification types
export const FollowNotification = Notification.discriminator(
  "FollowNotification",
  new mongoose.Schema({
    followerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  })
);

// This notification model is shared between Post and Comment
export const LikeNotification = Notification.discriminator(
  "LikeNotification",
  new mongoose.Schema({
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post", // Post
      required: true,
    },
    likerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  })
);

export const PostNotification = Notification.discriminator(
  "PostNotification",
  new mongoose.Schema({
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post", //Post
      required: true,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  })
);

export const CommentNotification = Notification.discriminator(
  "CommentNotification",
  new mongoose.Schema({
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post", //Post
      required: true,
    },
    commentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      required: true,
    },
    commenterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  })
);
