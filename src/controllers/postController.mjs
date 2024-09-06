import asyncHandler from "express-async-handler";

import { Post } from "../mongoose/schemas/post.mjs";
import { LikePostNotification } from "../mongoose/schemas/notifications.mjs";
import { User } from "../mongoose/schemas/users.mjs";
import { UserFeed } from "../mongoose/schemas/feed.mjs";

export const savePost = asyncHandler(async (request, response) => {
  const { content } = request.body;

  if (!request.user) {
    return response.status(401).json({ message: "Unauthorized" });
  }

  if (!content) {
    return response.status(400).json({ message: "Content is required" });
  }

  const newPost = new Post({
    ...request.body,
    author: request.user._id,
  });

  try {
    const savedPost = await newPost.save();

    const retrieveAuthor = await User.findById(savedPost.author).populate(
      "followers"
    );

    await UserFeed.updateOne(
      { userId: savedPost.author },
      {
        $push: {
          posts: {
            $each: [savedPost._id],
            $position: 0,
          },
        },
      },
      { upsert: true, new: true }
    );

    retrieveAuthor.followers.forEach(async (follower) => {
      /* Not a typical functionality for a social network platform  */
      /*
      const notification = new PostNotification({
        userId: follower._id,
        message: `${request.user.username} made a new post`,
        postId: savedPost.id,
        authorId: retrieveAuthor.id,
      });

      await notification.save();
      */

      await UserFeed.updateOne(
        { userId: follower.id },
        {
          $push: {
            posts: {
              $each: [savedPost.id],
              $position: 0,
            },
          },
        },
        { upsert: true, new: true }
      );

      //await Promise.all([notification, feedUpdate]);
    });

    return response.sendStatus(200);
  } catch (error) {
    throw new Error(error);
  }
});

export const editPost = asyncHandler(async (request, response) => {
  if (!request.user) {
    return response.status(400).json({ message: "Unauthorized" });
  }

  const { content } = request.body;
  const { id } = request.params;

  if (!content) {
    return response.status(400).json({ message: "Content is required" });
  }

  try {
    const retrievedPost = await Post.findById(id);

    if (retrievedPost.author.toString() !== request.user._id.toString()) {
      return response
        .status(400)
        .json({ message: "You can only edit your own content" });
    }
    const data = {
      $set: {
        ...request.body,
      },
    };

    const updatedPost = await Post.findByIdAndUpdate(id, data, { new: true });

    return response.status(200).json(updatedPost);
  } catch (error) {
    throw new Error(error);
  }
});

export const deletePost = asyncHandler(async (request, response) => {
  if (!request.user) {
    return response.status(400).json({ message: "Unauthorized" });
  }

  const { id } = request.params;

  try {
    const post = await Post.findById(id);

    if (post.author.toString() !== request.user._id.toString()) {
      return response
        .status(400)
        .json({ message: "You can only delete your own content" });
    }

    await Post.findByIdAndDelete(id);
    return response.sendStatus(200);
  } catch (error) {
    throw new Error(error);
  }
});

export const getPostsByUser = asyncHandler(async (request, response) => {
  if (!request.user) {
    return response.status(400).json({ message: "Unauthorized" });
  }

  const { userId } = request.params;

  const page = parseInt(request.query.page) || 1;
  const limit = parseInt(request.query.limit) || 5;

  try {
    const posts = await Post.find({ author: userId })
      .populate("author", "-password -strategy")
      .populate("likes", "-password -strategy");

    if (!posts) {
      return response.status(200).json({
        items: [],
        hasNextPage: false,
        page: 1,
        totalPages: 1,
      });
    }

    const totalPosts = posts.length;

    const startIndex = (page - 1) * limit;

    const totalPages = Math.ceil(totalPosts / limit);

    const paginatedPosts = posts.slice(startIndex, startIndex + limit);

    return response.status(200).json({
      items: paginatedPosts,
      hasNextPage: page < totalPages,
      page,
      totalPages,
    });
  } catch (error) {
    throw new Error(error);
  }
});

export const getPost = asyncHandler(async (request, response) => {
  if (!request.user) {
    return response.status(400).json({ message: "Unauthorized" });
  }

  const { id } = request.params;

  try {
    const post = await Post.findById(id)
      .populate({
        path: "comments",
        populate: [
          {
            path: "userId",
            select: "-password -strategy",
          },
          {
            path: "likes",
            select: "-password -strategy",
          },
        ],
      })
      .populate("likes", "-password")
      .populate("author", "-password");

    if (!post) {
      return response.status(404).json({ message: "Post not found" });
    }
    return response.status(200).json(post);
  } catch (error) {
    throw new Error(error);
  }
}); //

export const allPosts = asyncHandler(async (request, response) => {
  if (!request.user) {
    return response.status(400).json({ message: "Unauthorized" });
  }

  try {
    const posts = await Post.find()
      .populate("author", "-password")
      .populate({
        path: "comments",
        populate: {
          path: "author",
          select: "-password",
        },
      });
    return response.status(200).json(posts);
  } catch (error) {
    throw new Error(error);
  }
});

export const likePost = asyncHandler(async (request, response) => {
  if (!request.user) {
    return response.status(400).json({ message: "Unauthorized" });
  }

  const { id } = request.body;

  try {
    const post = await Post.findByIdAndUpdate(
      id,
      {
        $addToSet: { likes: request.user._id },
      },
      { new: true }
    ).populate("likes", "-_id -password");

    if (!post) {
      return response.status(404).json({ message: "Post not found" });
    }

    const notification = new LikePostNotification({
      userId: post.author,
      message: `${request.user.username} liked your post`,
      postId: post._id,
      likerId: request.user._id,
    });

    await notification.save();

    return response.sendStatus(200);
  } catch (error) {
    throw new Error(error);
  }
});

export const unlikePost = asyncHandler(async (request, response) => {
  if (!request.user) {
    return response.status(400).json({ message: "Unauthorized" });
  }

  const { id } = request.body;

  try {
    const post = await Post.findByIdAndUpdate(
      id,
      {
        $pull: { likes: request.user._id },
      },
      { new: true }
    ).populate("likes", "-_id -password");

    await LikePostNotification.findOneAndDelete({
      likerId: request.user.id,
      postId: post.id,
    });

    return response.sendStatus(200);
  } catch (error) {
    throw new Error(error);
  }
});

export const bookmarkPost = asyncHandler(async (request, response) => {
  if (!request.user) {
    return response.status(401).json({ message: "Unauthorized" });
  }

  const { id } = request.params;

  try {
    const user = await User.findByIdAndUpdate(
      request.user._id,
      {
        $addToSet: { bookmarks: id },
      },
      { new: true }
    );

    if (!user) {
      return response.status(404).json({ message: "User not found" });
    }

    return response.sendStatus(200);
  } catch (error) {
    throw new Error(error);
  }
});

export const unbookmarkPost = asyncHandler(async (request, response) => {
  if (!request.user) {
    return response.status(401).json({ message: "Unauthorized" });
  }

  const { id } = request.params;

  try {
    const user = await User.findByIdAndUpdate(
      request.user._id,
      {
        $pull: { bookmarks: id },
      },
      { new: true }
    );

    if (!user) {
      return response.status(404).json({ message: "User not found" });
    }

    return response.sendStatus(200);
  } catch (error) {
    throw new Error(error);
  }
});
