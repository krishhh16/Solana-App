import { Router } from "express";
import jwt from "jsonwebtoken"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { authMiddleWareUser } from "./middlewares";

import { PrismaClient } from "@prisma/client";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { taskUserInput } from "../types/types";
import { TOTAL_DECIMALS } from "./workerRoutes";
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
        }, process.env.JWT_SECRET_USER)

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
            //@ts-ignore
        }, process.env.JWT_SECRET_USER)

        res.json({
            token
        })
        }

})

route.get("/v1/getPresignedUrl", authMiddleWareUser, async (req, res) => {
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

route.post("/task", authMiddleWareUser, async (req, res) => {
    const body = req.body;
    // @ts-ignore
    const userId = req.userId;

    const parseData = taskUserInput.safeParse(body);

    if (!parseData.success){
        res.json({
            msg: "Invalid input type"
        })
    }

    // Parse the sig here to ensure identity and amount 

    const respone= await prisma.$transaction(async tx => {
        const response = await tx.task.create({
            data: {
                title:"Click on the most clickable thumbnail",
                amount: 1 * TOTAL_DECIMALS,
                signature: parseData.data?.signature || "signature",
                userId,
            }
        })

        await tx.option.createMany({
            //@ts-ignore Need to take care of it
            data: parseData.data?.options.map(x => ({
                image_url: x.imageUrl,
                taskId: response.id
            }))
        })
        
        return response;
    })

    res.json({
        id: respone.id
    })


})

route.get('/task', authMiddleWareUser, async (req, res) => {
    //@ts-ignore
    const taskId: string = req.query.taskId;
    // @ts-ignore
    const userId: string = req.userId;

    console.log(userId, taskId)

    // Find the first task with the provided taskId and only include the options parameter
    const taskDetails = await prisma.task.findFirst( {
        where: {
            userId: Number(userId),
            id: Number(taskId)
        },
        include: {
            options: true
        }
    })

    console.log(taskDetails);
        
    // Get all the submissions for the specified task_id and include the option
    const response = await prisma.sumbissions.findMany({
        where: {
            task_id: Number(taskId)
        },
        include: {
            option: true
        }
    });

    const result: Record<string, {
        count: number;
        tasks: {
            imageUrl: string
        }
    }>  = {};


    taskDetails?.options.forEach(option => {
        result[option.id] = {
            count: 0,
            tasks: {
                imageUrl: option.image_url
            }
        }
    })


    response.forEach(r => {
        
        result[r.option_id].count++;
        
    })

    res.json({
        result
    })

})


export default route;