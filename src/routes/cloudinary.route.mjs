import express from "express";
import { addImage } from "../controllers/cloudinary.controller.mjs";

const router = express.Router();

router.post("/api/image/upload", addImage);

export default router;
