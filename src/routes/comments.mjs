import express from "express";

import {
  createComment,
  getComment,
  editComment,
  deleteComment,
  allComments,
  likeComment,
  unlikeComment,
  getCommentsByUser,
  replyComment,
  deleteReply,
  allReplies,
} from "../controllers/commentController.mjs";

const router = express.Router();

router.post("/api/:postId/comments", createComment);
router.get("/api/comments/:userId", getCommentsByUser);
router.get("/api/comment/:commentId", getComment);
router.put("/api/comments/:id", editComment);
router.delete("/api/comments/:id", deleteComment);
router.get("/api/:postId/comments", allComments);
router.post("/api/comments/like", likeComment);
router.post("/api/comments/unlike", unlikeComment);

router.post("/api/comments/reply", replyComment);
router.delete("/api/reply/delete", deleteReply);
router.get("/api/comments/replies/:commentId", allReplies);

export default router;
