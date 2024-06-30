import express from "express";

import {
  allNotification,
  markAsRead,
} from "../controllers/notificationController.mjs";

const router = express.Router();

router.get("/api/notifications/:userId", allNotification);
router.put("/api/notifications/:id", markAsRead);

export default router;
