import { Router } from "express";
import jwt from "jsonwebtoken"
import { PrismaClient } from "@prisma/client";
import { authMiddleWareWorkers } from "./middlewares";
import { getTasks } from "../db";
import { submissionUserInput } from "../types/types";
const route = Router();

export const TOTAL_DECIMALS = 100_000_000;

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
    const tasks = await getTasks(userId);

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

route.post("/submission", authMiddleWareWorkers,  async(req, res) => {
    const body = req.body;
    //@ts-ignore
    const userId = req.userId;

    const parsedData = submissionUserInput.safeParse(body);
    if (parsedData.success) {
        const tasks = await getTasks(userId);
        if(!tasks || tasks?.id !== Number(parsedData.data.taskId)){ // Why're we using hte tasks.id's comparision with the provided taskId? isn't tasks going to be the first tasks
            return res.status(411).json({
                msg: "incorrect taskId"
            })
        }
        const amount = (Number(tasks.amount) / 100);
        const submission =  await prisma.$transaction(async tx => {
            const submission= await tx.sumbissions.create({
                data: {
                    option_id: Number(parsedData.data.selection),
                    worker_id: userId,
                    task_id: Number(parsedData.data.taskId),
                    amount
                }
            })


            await tx.worker.update({
                where: {
                    id: userId
                },
                data: {
                    pendingAmount: {
                        increment: Number(amount) 
                    }
                }
            })

            return submission;
        }) 


        const nextTask = getTasks(userId);
        res.status(200).json({
            nextTask,
            amount
        })

    } else {
        res.status(401).json({
            msg: "Invalid user inputs"
        })
    }

})

route.get("/balance", authMiddleWareWorkers, async (req, res) => {
    //@ts-ignore
    const userId: string = req.userId;

    const worker = await prisma.worker.findFirst({
        where: {
            id: Number(userId)
        }
    })

    res.json({
        pendingAmount: worker?.pendingAmount,
        lockedAmount: worker?.lockedAmount
    })
})

route.post("/payout", authMiddleWareWorkers, async (req, res) => {
    //@ts-ignore 
    const userId = req.userId;
    const worker = await prisma.worker.findFirst({
        where: {id: Number(userId)}
    })

    if (!worker) {
        res.json({
            msg: "Invalid worker"
        })
    }

    const address = worker?.address;
    const txnId = "0x5555";

    await prisma.$transaction(async tx => {
        await tx.worker.update({
            where: {
                id: userId
            }, 
            data: {
                pendingAmount: {
                    decrement: worker?.pendingAmount
                },
                lockedAmount: {
                    increment: worker?.lockedAmount
                }
            }
        })

        await tx.payout.create({
            data: {
                userId,
                amount: worker?.pendingAmount as number,
                status: "Processing",
                signature: txnId,
            }
        })
    })

    res.json({
        msg: "Processing Payout",
        amount: worker?.pendingAmount
    })
})


export default route;