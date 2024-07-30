import express from "express";

import {
  allNotification,
  markAsRead,
  allMessageNotification,
  messageRead,
} from "../controllers/notificationController.mjs";

const router = express.Router();

router.get("/api/notifications/:userId", allNotification);
router.get("/api/messagenotify/:userId", allMessageNotification);
router.post("/api/notifyread", messageRead);
router.put("/api/notifications/:id", markAsRead);

export default router;
