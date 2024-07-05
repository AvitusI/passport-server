import express from "express";
import passport from "passport";

import {
  allUsers,
  followUser,
  unfollowUser,
  getUser,
} from "../controllers/userController.mjs";

import "../strategies/local-strategy-signup.mjs";

export const router = express.Router();

router.post(
  "/api/users/activateAccount",
  passport.authenticate("local-signup"),
  (request, response) => {
    response.status(200).json(request.user);
  }
  /*
  async (request, response) => {
  const { body } = request;
  body.password = hashPassword(body.password);
  const newUser = new LocalUser(body);

  try {
    const savedUser = await newUser.save();
    return response.status(201).send(savedUser);
  } catch (err) {
    console.log(err);
    return response.sendStatus(400);
  }
} */
);

router.get("/api/users", allUsers);

router.post("/api/users/:id/follow", followUser);

router.post("/api/users/:id/unfollow", unfollowUser);

router.get("/api/users/:userId", getUser);

export default router;
