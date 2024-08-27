import express from "express";

import { retrieveMedia } from "../controllers/mediaController.mjs";

const router = express.Router();

router.get("/api/media/:userId", retrieveMedia);

export default router;
