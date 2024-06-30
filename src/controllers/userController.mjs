import asyncHandler from "express-async-handler";

import { User } from "../mongoose/schemas/users.mjs";
import { FollowNotification } from "../mongoose/schemas/notifications.mjs";
import { UserFeed } from "../mongoose/schemas/feed.mjs";
import { Post } from "../mongoose/schemas/post.mjs";

export const allUsers = asyncHandler(async (request, response) => {
  if (!request.user) {
    return response.status(401).send("Unauthorized");
  }

  try {
    const users = await User.find({}).populate(
      "followers",
      "_id username -strategy"
    );
    return response.status(200).send(users);
  } catch (error) {
    return response.sendStatus(400);
  }
});

export const getUser = asyncHandler(async (request, response) => {
  if (!request.user) {
    return response.status(400).json("Unauthorized");
  }

  const { userId } = request.params;

  try {
    const user = await User.findById(userId)
      .select("-password -strategy")
      .populate("followers", "-password -strategy");

    return response.status(200).send(user);
  } catch (error) {
    return response.sendStatus(400);
  }
});

export const followUser = asyncHandler(async (request, response) => {
  const { id } = request.params;

  if (!request.user) {
    return response.status(401).send("Unauthorized");
  }

  try {
    const userToFollow = await User.findByIdAndUpdate(
      id,
      {
        $addToSet: { followers: request.user._id },
      },
      { new: true }
    ).populate("followers", "_id username");

    if (!userToFollow) {
      return response.status(404).send("User not found");
    }

    const newNotification = new FollowNotification({
      userId: id,
      message: `${request.user.username} started following you`,
      followerId: request.user._id,
    });

    await newNotification.save();

    const firstFiftyPosts = await Post.find({ author: id })
      .sort({ createdAt: -1 })
      .limit(50);
    const postIds = firstFiftyPosts.map((post) => post._id);

    await UserFeed.findOneAndUpdate(
      { userId: request.user._id },
      {
        $push: {
          posts: {
            $each: postIds,
            $position: 0,
          },
        },
      },
      { new: true, upsert: true }
    );

    return response.status(200).send(userToFollow);
  } catch (error) {
    return response.sendStatus(400);
  }
});

export const unfollowUser = asyncHandler(async (request, response) => {
  const { id } = request.params;

  if (!request.user) {
    return response.status(401).send("Unauthorized");
  }

  try {
    const userToUnfollow = await User.findByIdAndUpdate(
      id,
      {
        $pull: { followers: request.user._id },
      },
      { new: true }
    ).populate("followers", "_id username");

    if (!userToUnfollow) {
      return response.status(404).send("User not found");
    }

    const postToRemove = await Post.find({ author: id });
    const postIds = postToRemove.map((post) => post._id);

    await UserFeed.updateOne(
      { userId: request.user._id },
      {
        $pull: { posts: { $in: postIds } },
      },
      { new: true }
    );

    return response.status(200).send(userToUnfollow);
  } catch (error) {
    return response.sendStatus(400);
  }
});
