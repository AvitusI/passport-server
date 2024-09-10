import express from "express";

import {
  allNotification,
  markAsRead,
  markAllAsRead,
  allMessageNotification,
  allNotificationMixed,
  messageRead,
  allMessageNotificationMixture,
  allMessageNotificationRead,
} from "../controllers/notificationController.mjs";

const router = express.Router();

router.get("/api/notifications/:userId", allNotification);
router.get("/api/notificationsAll/:userId", allNotificationMixed);
router.get("/api/messagenotify/:userId", allMessageNotification);
router.get("/api/messagenotifyAll/:userId", allMessageNotificationMixture);
router.post("/api/notifyread", messageRead);
router.put("/api/notifications", markAsRead);
router.put("/api/notifications/readAll", markAllAsRead);
router.put("/api/messagenotify/readAll", allMessageNotificationRead);

export default router;
