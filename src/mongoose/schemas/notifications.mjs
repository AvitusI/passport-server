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

export const LikePostNotification = Notification.discriminator(
  "LikePostNotification",
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

export const LikeCommentNotification = Notification.discriminator(
  "LikeCommentNotification",
  new mongoose.Schema({
    commentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment", // Comment
      required: true,
    },
    likerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  })
);

export const LikeReplyNotification = Notification.discriminator(
  "LikeReplyNotification",
  new mongoose.Schema({
    replyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reply",
      required: true,
    },
    likerId: {
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

export const ReplyNotification = Notification.discriminator(
  "ReplyNotification",
  new mongoose.Schema({
    commentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      required: true,
    },
    replyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reply",
      required: true,
    },
    replierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  })
);
