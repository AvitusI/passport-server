import express, { request, response } from 'express'

import { User } from '../mongoose/schemas/user.mjs'
import { hashPassword } from '../utils/helpers.mjs'

export const router = express.Router()

router.post("/api/users", async (request, response) => {
    const { body } = request
    console.log(body)
    body.password = hashPassword(body.password)
    console.log(body)
    const newUser = new User(body)
    
    try {
        const savedUser = await newUser.save()
        return response.status(201).send(savedUser)
    }
    catch (err) {
        console.log(err)
        return response.sendStatus(400)
    }
})

export default router