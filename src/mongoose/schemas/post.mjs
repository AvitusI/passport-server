import mongoose from "mongoose";
import { Comment } from "./comment.mjs";
import { LikePostNotification } from "./notifications.mjs";

const PostSchema = new mongoose.Schema(
  {
    content: {
      type: mongoose.Schema.Types.String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    pic: {
      type: mongoose.Schema.Types.String,
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

PostSchema.post("findOneAndDelete", async function (post) {
  if (post) {
    await Comment.deleteMany({ postId: post._id });
    console.log("Post deleted with its respective comments");
  }
});

PostSchema.post("findOneAndDelete", async function (post) {
  if (post) {
    await LikePostNotification.deleteMany({ postId: post._id });
    console.log("Post deleted with its associated notifications");
  }
});

export const Post = mongoose.model("Post", PostSchema);
