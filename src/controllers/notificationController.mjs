import asyncHandler from "express-async-handler";

import { Notification } from "../mongoose/schemas/notifications.mjs";
import { Message } from "../mongoose/schemas/message.mjs";
import { messageNotification } from "../mongoose/schemas/messageNotification.mjs";
import { Chat } from "../mongoose/schemas/chat.mjs";

export const allNotification = asyncHandler(async (request, response) => {
  if (!request.user) {
    return response.status(400).json("Unauthorized");
  }

  const { userId } = request.params;

  try {
    const notifications = await Notification.find({ userId }).populate(
      "userId",
      "-password"
    );

    return response.status(200).json(notifications);
  } catch (error) {
    return response.sendStatus(400);
  }
});

export const markAsRead = asyncHandler(async (request, response) => {
  if (!request.user) {
    return response.status(200).send("Unauthorized");
  }

  const { id } = request.params;

  try {
    const notification = await Notification.findById(id);

    if (notification.userId.toString() !== request.user.id.toString()) {
      return response
        .status(400)
        .send("You can only modify your own notifications");
    }

    const modifiedNotification = await Notification.findByIdAndUpdate(
      id,
      {
        $set: {
          read: true,
        },
      },
      { new: true }
    ).populate("userId", "-password");

    return response.status(200).json(modifiedNotification);
  } catch (error) {
    return response.sendStatus(400);
  }
});

export const allMessageNotification = asyncHandler(
  async (request, response) => {
    if (!request.user) {
      return response.status(400).json("Unauthorized");
    }

    const { userId } = request.params;

    try {
      const notifications = await messageNotification
        .find({ userId, read: false })
        .populate("messageId")
        .populate("senderId");

      return response.status(200).json(notifications);
    } catch (error) {
      return response.sendStatus(400);
    }
  }
);

export const messageRead = asyncHandler(async (request, response) => {
  if (!request.user) {
    return response.status(401).json("Unauthorised");
  }

  const { chatId } = request.body;

  try {
    await messageNotification.updateMany(
      { userId: request.user._id, chatId },
      {
        $set: {
          read: true,
        },
      }
    );

    const chat = await Chat.findById(chatId).populate("latestMessage");

    if (request.user._id.toString() !== chat.latestMessage.sender.toString()) {
      await Message.updateMany(
        { chat: chatId },
        {
          $set: {
            read: true,
          },
        }
      );
    }

    return response.sendStatus(200);
  } catch (error) {
    console.log(error);
    return response.sendStatus(400);
  }
});
