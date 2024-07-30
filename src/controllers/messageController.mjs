import asyncHandler from "express-async-handler";

import { Message } from "../mongoose/schemas/message.mjs";
import { messageNotification } from "../mongoose/schemas/messageNotification.mjs";
import { Chat } from "../mongoose/schemas/chat.mjs";

export const sendMessage = asyncHandler(async (request, response) => {
  if (!request.user) {
    return response.status(400).json("Unauthorized");
  }

  const { content, chatId } = request.body;
  console.log(request.body);

  if (!content || !chatId) {
    return response.status(400).json("Cannot send empty message");
  }

  const newMessage = {
    sender: request.user.id,
    content,
    chat: chatId,
  };

  const createdMessage = new Message(newMessage);

  try {
    const savedMessage = await createdMessage.save();

    await Chat.findByIdAndUpdate(chatId, {
      $set: {
        latestMessage: savedMessage.id,
      },
    });

    const populateMessage = (
      await savedMessage.populate("sender", "username avatar")
    ).populate({
      path: "chat",
      populate: {
        path: "users",
        select: "username avatar",
      },
    });

    const populatedMessage = await populateMessage;

    const users = populatedMessage.chat.users;

    const userId = users.filter((user) => user.id !== request.user.id)[0];

    // flaw, doesn't work, // it works
    const notification = await messageNotification({
      userId,
      messageId: populatedMessage.id,
      senderId: request.user.id,
      chatId,
    });

    await notification.save();

    return response.status(200).json(populatedMessage);
  } catch (error) {
    console.log(error);
    return response.status(400).json("An error occured");
  }
});

export const allMessages = asyncHandler(async (request, response) => {
  if (!request.user) {
    return response.status(400).send("Unauthorized");
  }

  const { chatId } = request.params;

  try {
    const messages = await Message.find({ chat: chatId })
      .populate("sender", "username avatar")
      .populate("chat");

    return response.status(200).json(messages);
  } catch (error) {
    return response.sendStatus(400);
  }
});
