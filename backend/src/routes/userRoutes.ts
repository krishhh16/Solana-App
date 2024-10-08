import { Router } from "express";
import jwt from "jsonwebtoken"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { authMiddleWareUser } from "./middlewares";
import { PrismaClient } from "@prisma/client";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { taskUserInput } from "../types/types";
import { TOTAL_DECIMALS } from "./workerRoutes";
import {Connection, PublicKey, Transaction} from "@solana/web3.js"
import nacl from "tweetnacl";

const connection = new Connection("https://solana-devnet.g.alchemy.com/v2/mSOKolKC5DWNK9KeMWIEoN9TxSNWspzy")

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
    const {publicKey, signature} = req.body;
    try {
    console.log(signature)
    const signatureString = "You're a verified exceliWorker"
    const stringEncoded = new TextEncoder().encode(signatureString)
    const sign = new Uint8Array(Object.values(signature));
    const pubkey = new PublicKey(publicKey).toBytes()

    const result = nacl.sign.detached.verify(
        stringEncoded,
        sign,
        pubkey
    )
    
    if (!result) {
        return res.status(401).json({
            msg:"Invalid User"
        })
    }
    } catch (err) {
        console.log(err)
        return res.json({
            msg: "Bad signature"
        })
    }


    const existingUser = await prisma.user.findFirst({
        where: { address: publicKey }
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
                address: publicKey
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

route.post("/v1/task", authMiddleWareUser, async (req, res) => {
    const body = req.body;
    // @ts-ignore
    const userId = req.userId;

    console.log(userId)
    const parseData = taskUserInput.safeParse(body);

    if (!parseData.success){
        res.json({
            msg: "Invalid input type"
        })
    }

    /// !!! IMPORTANT :- PLEASE ADD VERIFICATION FOR THE TRANSACTION LIKE SENDER and everything

    // const transaction = await connection.getTransaction(parseData.data?.signature as string, {
    //     maxSupportedTransactionVersion: 1
    // })

    // if ((transaction?.meta?.postBalances[1] ?? 0) - (transaction?.meta?.preBalances[1] ?? 0) !== 100000000) {
    //     return res.status(411).json({
    //         msg: "Transaction signature/amount incorrect"
    //     })
    // }

    // if (transaction?.transaction.message.getAccountKeys().get(1)?.toString() !== "AChE4XuUi4SEh7zSZj25mcEFWwWmiESJDoC3Hoy6kj37"){
    //     return res.status(411).json({
    //         msg:"Transaction sent to wrong address"
    //     })
    // }

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
    console.log(result)
    res.json({
        result,
        taskDetails
    })

})


export default route;