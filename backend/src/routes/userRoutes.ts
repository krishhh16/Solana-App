import { Router } from "express";
import jwt from "jsonwebtoken"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { authMiddleWare } from "./middlewares";

import { PrismaClient } from "@prisma/client";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
const route = Router();
//@ts-ignore
const s3Client = new S3Client({
    credentials: {
        accessKeyId: process.env.AMAZON_ACCESS_KEY,
        secretAccessKey: process.env.AMAZON_SECRET_KEY
    },
    region: "eu-north-1"
});


const prisma = new PrismaClient()
route.post('/v1/signin', async (req, res) => {
    const walletAddress = "AChE4XuUi4SEh7zSZj25mcEFWwWmiESJDoC3Hoy6kj37"

    const existingUser = await prisma.user.findFirst({
        where: { address: walletAddress }
    })

    if (existingUser) {
        const token = jwt.sign({
            userId: existingUser.id
            //@ts-ignore
        }, process.env.JWT_SECRET)

        res.json({
            token
        })

    } else {
        const someUser = await prisma.user.create({
            data: {
                address: walletAddress
            }
        })
        const token = jwt.sign({
            userId: someUser.id
        }, "Some secret key")

        res.json({
            token
        })
        }

})

route.get("/v1/getPresignedUrl", authMiddleWare, async (req, res) => {
    // @ts-ignore
    const userId = req.userId;

    const {url, fields} = await createPresignedPost(s3Client, {
        Bucket: "decentralized-feverrr",
        Key: `images/${userId}/${Math.random()}/image.jpg`,
        Conditions: [
            ["content-length-range", 0, 5 * 1024 * 1024] // 5 mb max
        ],
        Fields: {
            "Content-Type": 'image/jpg'
        },
        Expires: 3600
    })


    console.log(url, fields)
    res.json({
        preSignedUrl: url,
        fields   
    })
})

export default route;