import { Router } from "express";
import jwt from "jsonwebtoken"
import { PrismaClient } from "@prisma/client";
const route = Router();

const prisma = new PrismaClient()
route.post('/v1/signin', async (req, res) => {
    const walletAddress = "AChE4XuUi4SEh7zSZj25mcEFWwWmiESJDoC3Hoy6kj37"

    const existingUser = await prisma.user.findFirst({
        where: { address: walletAddress }
    })

    if (existingUser) {
        const token = jwt.sign({
            address: walletAddress
        }, "Some secret key")
        res.json({token})
    } else {
        await prisma.user.create({
            data: {
                address: walletAddress
            }
        })
        const token = jwt.sign({
            address: walletAddress
        }, "Some secret key")

        res.json({token})
    }

})

route.get("/getPresignedUrl", (req, res) => {
    
})

export default route;