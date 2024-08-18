import z from "zod"

export const taskUserInput = z.object({
    options: z.array(z.object({
        imageUrl: z.string()
    })),
    title: z.string().optional(),
    signature: z.string()
})


export const submissionUserInput = z.object({
    taskId: z.string(),
    selection: z.string()
})