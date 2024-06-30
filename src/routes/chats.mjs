import express from "express";

import { getChats, accessChat } from "../controllers/chatController.mjs";

const router = express.Router();

router.post("/api/chat", accessChat);
router.get("/api/chat", getChats);

export default router;
