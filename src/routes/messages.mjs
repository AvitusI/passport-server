import express from "express";

import { sendMessage, allMessages } from "../controllers/messageController.mjs";

const router = express.Router();

router.post("/api/messages", sendMessage);
router.get("/api/messages/:chatId", allMessages);

export default router;
