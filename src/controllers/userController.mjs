import asyncHandler from "express-async-handler";
import crypto from "crypto";
import bcrypt from "bcrypt";

import { User, LocalUser } from "../mongoose/schemas/users.mjs";
import { ActivateAccountToken } from "../mongoose/schemas/token.mjs";
import { FollowNotification } from "../mongoose/schemas/notifications.mjs";
import { UserFeed } from "../mongoose/schemas/feed.mjs";
import { Post } from "../mongoose/schemas/post.mjs";
import { hashPassword } from "../utils/helpers.mjs";
import { sendEmail } from "../utils/email/sendEmail.mjs";
import {
  requestPasswordReset,
  resetPassword,
} from "../passwordService/resetPassword.mjs";

export const registerUser = asyncHandler(async (request, response) => {
  const { body } = request;

  try {
    const user = await User.findOne({ email: body.email });

    if (user) {
      return response.status(400).json({ message: "user already exist" });
    }

    body.password = hashPassword(body.password);

    const newUser = new LocalUser(body);

    const savedUser = await newUser.save();

    let activateToken = crypto.randomBytes(32).toString("hex");

    const hash = await bcrypt.hash(
      activateToken,
      Number(process.env.BCRYPT_SALT)
    );

    await new ActivateAccountToken({
      userId: savedUser._id,
      token: hash,
      createdAt: Date.now(),
    }).save();

    const link = `${process.env.CLIENT_URL}/accountActivate?token=${activateToken}&id=${savedUser._id}`;

    sendEmail(
      savedUser.email,
      "Account Activation Request",
      { name: savedUser.username, link: link },
      "activateAccount.handlebars"
    );

    return response.status(200).json(link);
  } catch (err) {
    console.error(err);
    return response.sendStatus(400);
  }
});

export const allUsers = asyncHandler(async (request, response) => {
  if (!request.user) {
    return response.status(401).json("Unauthorized");
  }

  try {
    const users = await User.find({}).populate(
      "followers",
      "_id username -strategy"
    );
    return response.status(200).json(users);
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

export const editProfile = asyncHandler(async (request, response) => {
  if (!request.user) {
    return response.status(401).send("Unauthorized");
  }

  const { userId } = request.params;

  if (request.user._id.toString() !== userId) {
    return response
      .status(400)
      .json("You are not authorized to edit this profile");
  }

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: request.body,
      },
      {
        new: true,
      }
    ).select("-password -strategy");

    if (!user) {
      return response.status(404).json("User not found");
    }

    return response.status(200).json(user);
  } catch (error) {
    console.error(error);
    return response.sendStatus(400);
  }
});

export const followUser = asyncHandler(async (request, response) => {
  const { userId } = request.body;

  if (!request.user) {
    return response.status(401).send("Unauthorized");
  }

  try {
    const userToFollow = await User.findByIdAndUpdate(
      userId,
      {
        $addToSet: { followers: request.user._id },
      },
      { new: true }
    ).populate("followers", "_id username");

    if (!userToFollow) {
      return response.status(404).json("User not found");
    }

    const newNotification = new FollowNotification({
      userId: userId,
      message: `${request.user.username} started following you`,
      followerId: request.user._id,
    });

    await newNotification.save();

    const firstFifteenPosts = await Post.find({ author: userId })
      .sort({ createdAt: -1 })
      .limit(15);
    const postIds = firstFifteenPosts.map((post) => post._id);

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

    return response.sendStatus(200);
  } catch (error) {
    return response.sendStatus(400);
  }
});

export const unfollowUser = asyncHandler(async (request, response) => {
  const { userId } = request.body;

  if (!request.user) {
    return response.status(401).send("Unauthorized");
  }

  try {
    const userToUnfollow = await User.findByIdAndUpdate(
      userId,
      {
        $pull: { followers: request.user._id },
      },
      { new: true }
    ).populate("followers", "_id username");

    if (!userToUnfollow) {
      return response.status(404).send("User not found");
    }

    await FollowNotification.findOneAndDelete({
      followerId: request.user.id,
      userId,
    });

    const postToRemove = await Post.find({ author: userId });
    const postIds = postToRemove.map((post) => post._id);

    await UserFeed.updateOne(
      { userId: request.user._id },
      {
        $pull: { posts: { $in: postIds } },
      },
      { new: true }
    );

    return response.sendStatus(200);
  } catch (error) {
    return response.sendStatus(400);
  }
});

export const resetPasswordRequestController = asyncHandler(
  async (request, response) => {
    const requestPasswordResetService = await requestPasswordReset(
      request.body.email
    );

    return response.json(requestPasswordResetService);
  }
);

export const resetPasswordController = asyncHandler(
  async (request, response) => {
    const resetPasswordService = await resetPassword(
      request.body.userId,
      request.body.token,
      request.body.password
    );

    return response.json(resetPasswordService);
  }
);
