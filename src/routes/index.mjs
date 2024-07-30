import { Router } from "express";

import usersRouter from "./users.mjs";
import postsRouter from "./posts.mjs";
import chatsRouter from "./chats.mjs";
import commentsRouter from "./comments.mjs";
import messagesRouter from "./messages.mjs";
import notificationsRouter from "./notifications.mjs";
import userFeedRouter from "./feeds.mjs";
import imageUploadRouter from "./cloudinary.route.mjs";

const router = Router();

router.use(usersRouter);
router.use(postsRouter);
router.use(chatsRouter);
router.use(commentsRouter);
router.use(messagesRouter);
router.use(notificationsRouter);
router.use(userFeedRouter);
router.use(imageUploadRouter);

export default router;
