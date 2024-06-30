import asyncHandler from "express-async-handler";

import { Chat } from "../mongoose/schemas/chat.mjs";

export const getChats = asyncHandler(async (request, response) => {
  if (!request.user) {
    return response.status(400).json("Unauthorized");
  }

  try {
    const chats = await Chat.find({
      users: { $elemMatch: { $eq: request.user._id } },
    })
      .populate("users", "-password")
      .populate({
        path: "latestMessage",
        populate: {
          path: "sender",
          select: "-password -strategy",
        },
      })
      .sort({ updatedAt: -1 });

    return response.status(200).json(chats);
  } catch (error) {
    console.log(error);
    return response.sendStatus(400);
  }
});

export const accessChat = asyncHandler(async (request, response) => {
  if (!request.user) {
    return response.status(400).send("Unauthorized");
  }

  const { userId } = request.body;

  const chat = await Chat.find({
    $and: [
      { users: { $elemMatch: { $eq: request.user.id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate({
      path: "latestMessage",
      populate: {
        path: "sender",
        select: "username avatar",
      },
    });

  if (chat.length > 0) {
    return response.status(200).json(chat);
  } else {
    const chatData = {
      users: [request.user.id, userId],
    };

    try {
      const createdChat = new Chat(chatData);

      const savedChat = await createdChat.save();

      const retrievedChat = await Chat.findById(savedChat.id).populate(
        "users",
        "-password"
      );

      return response.status(200).json(retrievedChat);
    } catch (error) {
      return response.sendStatus(400);
    }
  }
});
