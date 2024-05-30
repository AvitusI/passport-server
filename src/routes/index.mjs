import { Router } from "express";

import usersRouter from "./users.mjs"

const router = Router()

router.use(usersRouter)
// router.use(productsRouter)
// router.use(authRouter)

export default router