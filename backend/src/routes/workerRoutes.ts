import { Router } from "express";
import jwt from "jsonwebtoken"
import { PrismaClient } from "@prisma/client";
import { authMiddleWareWorkers } from "./middlewares";
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
            //@ts-ignore
        }, process.env.JWT_SECRET_WORKER)

        res.json({
            token
        })
    } else {

        const someUser = await prisma.worker.create({
            data: {
                address: walletAddress,
                pendingAmount: 0,
                lockedAmount: 0
            }
        })
        const token = jwt.sign({
            userId: someUser.id
            //@ts-ignore
        }, process.env.JWT_SECRET_WORKER)

        res.json({
            token
        })
        }

})

route.get("/v1/nextTasks", authMiddleWareWorkers, async (req, res) => {
    // @ts-ignore
    const userId = req.userId
    console.log(userId);
    const tasks = await prisma.task.findFirst({
        where: {
            submissions: {
                none: {
                    worker_id: userId,
                }
            }, 
            done: false
        },
        select: {
            title: true,
            options: true
        }       
    })

    console.log(tasks)

    if (!tasks) {
        res.json({
            msg: "You do not have any taskss left anymore"
        })
    } else {
        res.json({
            tasks
        })
    }

})




export default route;