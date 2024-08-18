import { Router } from "express";
import jwt from "jsonwebtoken"
import { PrismaClient } from "@prisma/client";
const route = Router();

const prisma = new PrismaClient()
route.post('/v1/signin', async (req, res) => {
    const walletAddress = "AChE4XuUi4SEh7zSZj25mcEFWwWmiESJDoC3Hoy6kj37"

    const existingUser = await prisma.worker.findFirst({
        where: { address: walletAddress }
    })

    if (existingUser) {
        const token = jwt.sign({
            userId: existingUser.id
        }, "Some secret key")
        res.json({token})
    } else {
        const someUser = await prisma.worker.create({
            data: {
                address: walletAddress
            }
        })
        const token = jwt.sign({
            userId: someUser.id
        }, "Some secret key")

        res.json({token})
    }

})

export default route;