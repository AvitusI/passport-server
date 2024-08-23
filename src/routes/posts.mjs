import express from "express";

import {
  savePost,
  editPost,
  deletePost,
  allPosts,
  likePost,
  unlikePost,
  getPostsByUser,
  getPost,
} from "../controllers/postController.mjs";

const router = express.Router();

router.post("/api/posts", savePost);
router.put("/api/posts/:id", editPost);
router.delete("/api/posts/:id", deletePost);
router.get("/api/posts", allPosts);
router.get("/api/posts/user/:userId", getPostsByUser);
router.get("/api/posts/:id", getPost);
router.post("/api/posts/like", likePost);
router.post("/api/posts/unlike", unlikePost);

export default router;
