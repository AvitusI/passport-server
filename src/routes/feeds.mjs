import express from "express";

import { getUserFeed } from "../controllers/feedController.mjs";

const router = express.Router();

router.get("/api/feed", getUserFeed);

export default router;
