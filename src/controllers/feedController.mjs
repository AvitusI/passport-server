import asyncHandler from "express-async-handler";

import { UserFeed } from "../mongoose/schemas/feed.mjs";

export const getUserFeed = asyncHandler(async (request, response) => {
  if (!request.user) {
    return response.status(401).json({ message: "Not authorized" });
  }

  const page = parseInt(request.query.page) || 1;
  const limit = parseInt(request.query.limit) || 5;

  try {
    const userFeed = await UserFeed.findOne({
      userId: request.user._id,
    }).populate({
      path: "posts",
      populate: [
        {
          path: "author",
          select: "username avatar -strategy",
        },
        {
          path: "likes",
          select: "username avatar -strategy",
        },
      ],
    });

    if (!userFeed) {
      return response.status(200).json({
        items: [],
        hasNextPage: false,
        page: 1,
        totalPages: 1,
      });
    }

    const totalPosts = userFeed.posts.length;

    const startIndex = (page - 1) * limit;

    const totalPages = Math.ceil(totalPosts / limit);

    const paginatedPosts = userFeed.posts.slice(startIndex, startIndex + limit);

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
