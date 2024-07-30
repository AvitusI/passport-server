import mongoose from "mongoose";

const MessageNotification = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  read: {
    type: Boolean,
    required: true,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  messageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message",
    required: true,
  },
  chatId: {
    // This will help us mark notifications as read
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chat",
    required: true,
  },
});

export const messageNotification = mongoose.model(
  "MessageNotification",
  MessageNotification
);
