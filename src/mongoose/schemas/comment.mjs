import mongoose from "mongoose";

const CommentModel = new mongoose.Schema(
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

export const Comment = mongoose.model("Comment", CommentModel);
