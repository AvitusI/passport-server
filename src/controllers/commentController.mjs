import asyncHandler from "express-async-handler";

import { Post } from "../mongoose/schemas/post.mjs";
import { Comment } from "../mongoose/schemas/comment.mjs";
import { Reply } from "../mongoose/schemas/reply.mjs";
import {
  CommentNotification,
  LikeCommentNotification,
} from "../mongoose/schemas/notifications.mjs";

export const createComment = asyncHandler(async (request, response) => {
  if (!request.user) {
    return response.status(400).json({ message: "Unauthorized" });
  }

  const { content } = request.body;
  const { postId } = request.params;

  if (!content) {
    return response
      .status(400)
      .json({ message: "The content cannot be empty" });
  }

  const comment = new Comment({
    content,
    userId: request.user._id,
    postId,
  });

  try {
    const savedComment = await comment.save();

    const commentedPost = await Post.findByIdAndUpdate(
      postId,
      {
        $addToSet: { comments: savedComment.id },
      },
      { new: true }
    )
      .populate("author", "-password")
      .populate({
        path: "comments",
        populate: {
          path: "userId",
          select: "-password",
        },
      });

    if (!commentedPost.author._id.equals(request.user._id)) {
      const notification = new CommentNotification({
        userId: commentedPost.author._id,
        message: `${request.user.username} commented on your post`,
        postId,
        commentId: savedComment.id,
        commenterId: request.user.id,
      });

      await notification.save();
    }

    return response.status(200).json(commentedPost);
  } catch (error) {
    throw new Error(error);
  }
});

export const getCommentsByUser = asyncHandler(async (request, response) => {
  if (!request.user) {
    return response.status(400).json({ message: "Unauthorized" });
  }

  const { userId } = request.params;

  const page = parseInt(request.query.page) || 1;
  const limit = parseInt(request.query.limit) || 5;

  try {
    const comments = await Comment.find({ userId })
      .populate("userId", "-password -strategy")
      .populate("likes", "-password -strategy");

    if (!comments) {
      return response.status(200).json({
        items: [],
        hasNextPage: false,
        page: 1,
        totalPages: 1,
      });
    }

    const totalComments = comments.length;

    const startIndex = (page - 1) * limit;

    const totalPages = Math.ceil(totalComments / limit);

    const paginatedComments = comments.slice(startIndex, startIndex + limit);

    return response.status(200).json({
      items: paginatedComments,
      hasNextPage: page < totalPages,
      page,
      totalPages,
    });
  } catch (error) {
    throw new Error(error);
  }
});

export const getComment = asyncHandler(async (request, response) => {
  if (!request.user) {
    return response.status(401).json({ message: "Unauthorized" });
  }

  const { commentId } = request.params;

  try {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return response.status(404).json({ message: "comment not found" });
    }

    return response.status(200).json(comment);
  } catch (error) {
    throw new Error(error);
  }
});

export const editComment = asyncHandler(async (request, response) => {
  if (!request.user) {
    return response.status(400).json({ message: "Unauthorized" });
  }

  const { content } = request.body;
  const { id } = request.params;

  if (!content) {
    return response
      .status(400)
      .json({ message: "The content cannot be empty" });
  }

  try {
    const comment = await Comment.findById(id);

    if (comment.userId.toString() !== request.user.id.toString()) {
      return response
        .status(400)
        .json({ message: "You can only modify your own content" });
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      id,
      {
        $set: {
          ...request.body,
        },
      },
      { new: true }
    ).populate("userId", "-password");

    if (!updatedComment)
      return response.status(404).json({ message: "Comment not found!" });

    return response.status(200).json(updatedComment);
  } catch (error) {
    throw new Error(error);
  }
});

export const deleteComment = asyncHandler(async (request, response) => {
  if (!request.user) {
    return response.status(400).json({ message: "Unauthorized" });
  }

  const { id } = request.params;

  try {
    const comment = await Comment.findById(id);

    if (comment.userId.toString() !== request.user._id.toString()) {
      return response
        .status(400)
        .json({ message: "You can only delete your own content" });
    }

    await Comment.findByIdAndDelete(id);

    return response.sendStatus(200);
  } catch (error) {
    throw new Error(error);
  }
});

export const allComments = asyncHandler(async (request, response) => {
  if (!request.user) {
    return response.status(400).json({ message: "Unauthorized" });
  }

  const { postId } = request.params;

  try {
    const comments = await Comment.find({ postId })
      .populate("postId")
      .populate("likes")
      .sort({ createdAt: -1 });

    return response.status(200).json(comments);
  } catch (error) {
    throw new Error(error);
  }
});

export const likeComment = asyncHandler(async (request, response) => {
  if (!request.user) {
    return response.status(400).json({ message: "Unauthorized" });
  }

  const { id } = request.body;

  try {
    const likedComment = await Comment.findByIdAndUpdate(
      id,
      {
        $addToSet: { likes: request.user.id },
      },
      { new: true }
    )
      .populate("userId", "-password")
      .populate("likes", "-password");

    const notification = new LikeCommentNotification({
      userId: likedComment.userId.id,
      message: `${request.user.username} liked your comment`,
      commentId: likedComment.id,
      likerId: request.user.id,
    });

    await notification.save();

    return response.sendStatus(200);
  } catch (error) {
    throw new Error(error);
  }
});

export const unlikeComment = asyncHandler(async (request, response) => {
  if (!request.user) {
    return response.status(400).json({ message: "Unauthorized" });
  }

  const { id } = request.body;

  try {
    const unlikedComment = await Comment.findByIdAndUpdate(
      id,
      {
        $pull: { likes: request.user.id },
      },
      { new: true }
    )
      .populate("userId", "-password")
      .populate("likes", "-password");

    await LikeCommentNotification.findOneAndDelete({
      likerId: request.user.id,
      commentId: unlikedComment.id,
    });

    return response.sendStatus(200);
  } catch (error) {
    throw new Error(error);
  }
});

export const replyComment = asyncHandler(async (request, response) => {
  if (!request.user) {
    return response.status(400).json({ message: "Unauthorized" });
  }

  const { content, commentId } = request.body;

  if (!content) {
    return response
      .status(400)
      .json({ message: "The content cannot be empty" });
  }

  try {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return response.status(404).json({ message: "Comment not found" });
    }

    const reply = new Reply({
      content,
      userId: request.user._id,
      commentId,
    });

    const savedReply = await reply.save();

    await Comment.findByIdAndUpdate(
      commentId,
      {
        $addToSet: { replies: savedReply._id },
      },
      { new: true }
    );

    return response.status(200).json(savedReply);
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
});

export const likeReply = asyncHandler(async (request, response) => {
  if (!request.user) {
    return response.status(401).json({ message: "Unauthorized" });
  }

  const { replyId } = request.body;

  try {
    const reply = await Reply.findByIdAndUpdate(
      replyId,
      {
        $addToSet: { likes: request.user.id },
      },
      { new: true }
    );

    if (!reply) {
      return response.status(404).json({ message: "Reply not found" });
    }

    return response.sendStatus(200);
  } catch (error) {
    throw new Error(error);
  }
});

export const unlikeReply = asyncHandler(async (request, response) => {
  if (!request.user) {
    return response.status(401).json({ message: "Unauthorized" });
  }

  const { replyId } = request.body;

  try {
    const reply = await Reply.findByIdAndUpdate(
      replyId,
      {
        $pull: { likes: request.user.id },
      },
      { new: true }
    );

    if (!reply) {
      return response.status(404).json({ message: "Reply not found" });
    }

    return response.sendStatus(200);
  } catch (error) {
    throw new Error(error);
  }
});

export const deleteReply = asyncHandler(async (request, response) => {
  if (!request.user) {
    return response.status(400).json({ message: "Unauthorized" });
  }

  const { id } = request.body;

  try {
    const reply = await Reply.findById(id);

    if (!reply) {
      return response.status(404).json({ message: "Reply not found" });
    }

    if (reply.userId.toString() !== request.user._id.toString()) {
      return response
        .status(400)
        .json({ message: "You can only delete your own content" });
    }

    await Reply.findByIdAndDelete(reply._id);

    await Comment.findByIdAndUpdate(
      reply.commentId,
      {
        $pull: { replies: reply._id },
      },
      { new: true }
    );

    return response.sendStatus(200);
  } catch (error) {
    throw new Error(error);
  }
});

export const allReplies = asyncHandler(async (request, response) => {
  if (!request.user) {
    return response.status(400).send({ message: "Unauthorized" });
  }

  const { commentId } = request.params;

  try {
    const comment = await Reply.find({ commentId })
      .populate("userId", "-password")
      .populate("likes", "-password")
      .populate("commentId")
      .sort({ createdAt: -1 });

    return response.status(200).json(comment);
  } catch (error) {
    throw new Error(error);
  }
});
