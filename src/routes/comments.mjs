import express from "express";

import {
  createComment,
  editComment,
  deleteComment,
  allComments,
  likeComment,
  unlikeComment,
  getCommentsByUser,
} from "../controllers/commentController.mjs";

const router = express.Router();

router.post("/api/:postId/comments", createComment);
router.get("/api/comments/:userId", getCommentsByUser);
router.put("/api/comments/:id", editComment);
router.delete("/api/comments/:id", deleteComment);
router.get("/api/:postId/comments", allComments);
router.post("/api/comments/like", likeComment);
router.post("/api/comments/unlike", unlikeComment);

export default router;
