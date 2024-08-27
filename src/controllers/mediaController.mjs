import mongoose from "mongoose";
import asyncHandler from "express-async-handler";

import { Post } from "../mongoose/schemas/post.mjs";

export const retrieveMedia = asyncHandler(async (request, response) => {
  if (!request.user) {
    return response.status(400).json("Unauthorized");
  }

  const { userId } = request.params;

  if (!userId) {
    return response.status(401).json("Invalid request");
  }

  const authorId = new mongoose.Types.ObjectId(userId);

  try {
    const aggregatedMedia = await Post.aggregate([
      {
        $match: {
          author: authorId,
          pic: { $exists: true, $ne: null },
        },
      },
      {
        $unset: [
          "content",
          "comments",
          "likes",
          "createdAt",
          "updatedAt",
          "__v",
        ],
      },
    ]);

    return response.status(200).send(aggregatedMedia);
  } catch (error) {
    console.error(error);
    return response.sendStatus(400);
  }
});
