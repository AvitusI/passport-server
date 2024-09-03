import mongoose from "mongoose";

const ReplySchema = new mongoose.Schema(
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
    commentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Comment",
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

export const Reply = mongoose.model("Reply", ReplySchema);
