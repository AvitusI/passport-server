import express from "express";
import passport from "passport";

import {
  allUsers,
  followUser,
  unfollowUser,
  getUser,
  registerUser,
  resetPasswordController,
  resetPasswordRequestController,
} from "../controllers/userController.mjs";

import "../strategies/local-strategy-signup.mjs";

export const router = express.Router();

router.post(
  "/api/users/activateAccount",
  passport.authenticate("local-signup"),
  async (request, response) => {
    response.status(200).json(request.user);
  }
);

// req.login passport

router.post("/api/users", registerUser);

router.get("/api/users", allUsers);

router.post("/api/users/:id/follow", followUser);

router.post("/api/users/:id/unfollow", unfollowUser);

router.get("/api/users/:userId", getUser);

router.post("/api/users/requestResetPassword", resetPasswordRequestController);

router.post("/api/users/resetPassword", resetPasswordController);

export default router;
