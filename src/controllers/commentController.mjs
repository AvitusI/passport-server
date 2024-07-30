import asyncHandler from "express-async-handler";

import { Comment } from "../mongoose/schemas/comment.mjs";
import { Post } from "../mongoose/schemas/post.mjs";
import {
  CommentNotification,
  LikeNotification,
} from "../mongoose/schemas/notifications.mjs";

export const createComment = asyncHandler(async (request, response) => {
  if (!request.user) {
    return response.status(400).json("Unauthorized");
  }

  const { content } = request.body;
  const { postId } = request.params;

  if (!content) {
    return response.status(400).json("The content cannot be empty");
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
    return response.sendStatus(400);
  }
});

export const getCommentsByUser = asyncHandler(async (request, response) => {
  if (!request.user) {
    return response.status(400).json("Unauthorized");
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
    return response.status(400).json({ message: message.error });
  }
});

export const editComment = asyncHandler(async (request, response) => {
  if (!request.user) {
    return response.status(400).send("Unauthorized");
  }

  const { content } = request.body;
  const { id } = request.params;

  if (!content) {
    return response.status(400).send("The content cannot be empty");
  }

  try {
    const comment = await Comment.findById(id);

    if (comment.userId.toString() !== request.user.id.toString()) {
      return response.status(400).send("You can only modify your own content");
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

    if (!updatedComment) return response.status(400).send("Comment not found!");

    return response.status(200).json(updatedComment);
  } catch (error) {
    return response.sendStatus(400);
  }
});

export const deleteComment = asyncHandler(async (request, response) => {
  if (!request.user) {
    return response.status(400).send("Unauthorized");
  }

  const { id } = request.params;

  try {
    const comment = await Comment.findById(id);

    if (comment.userId.toString() !== request.user._id.toString()) {
      return response.status(400).send("You can only delete your own content");
    }

    await Comment.findByIdAndDelete(id);

    return response.sendStatus(200);
  } catch (error) {
    return response.sendStatus(400);
  }
});

export const allComments = asyncHandler(async (request, response) => {
  if (!request.user) {
    return response.status(400).send("Unauthorized");
  }

  const { postId } = request.params;

  try {
    const comments = await Comment.find({ postId }).populate("postId");

    return response.status(200).json(comments);
  } catch (error) {
    return response.sendStatus(400);
  }
});

export const likeComment = asyncHandler(async (request, response) => {
  if (!request.user) {
    return response.status(400).send("Unauthorized");
  }

  const { id } = request.params;

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

    const notification = new LikeNotification({
      userId: likedComment.userId.id,
      message: `${request.user.username} liked your comment`,
      postId: likedComment.id,
      likerId: request.user.id,
    });

    await notification.save();

    return response.status(200).json(likedComment);
  } catch (error) {
    return response.sendStatus(400);
  }
});

export const unlikeComment = asyncHandler(async (request, response) => {
  if (!request.user) {
    return response.status(400).send("Unauthorized");
  }

  const { id } = request.params;

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

    return response.status(200).json(unlikedComment);
  } catch (error) {
    return response.sendStatus(400);
  }
});
