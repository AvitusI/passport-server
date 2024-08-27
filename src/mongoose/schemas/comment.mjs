import mongoose from "mongoose";
import { LikeCommentNotification } from "./notifications.mjs";
import { CommentNotification } from "./notifications.mjs";

const CommentSchema = new mongoose.Schema(
  {
    content: {
      type: mongoose.Schema.Types.String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Post",
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

CommentSchema.post("findOneAndDelete", async function (comment) {
  if (comment) {
    await LikeCommentNotification.deleteMany({ commentId: comment._id });
    console.log("Comment deleted with its associated likes");
  }
});

CommentSchema.post("findOneAndDelete", async function (comment) {
  if (comment) {
    await CommentNotification.deleteMany({ commentId: comment._id });
    console.log("Comment deleted together with its notifications");
  }
});

export const Comment = mongoose.model("Comment", CommentSchema);
