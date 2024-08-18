import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient();


export async function getTasks(userId: number) {
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
            options: true,
            id: true,
            amount: true
        }       
    })


    return tasks
}