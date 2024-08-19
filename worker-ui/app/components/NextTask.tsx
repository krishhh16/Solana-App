'use client'

import {BACKEND_URL } from "../../utils/utils"
import axios from "axios"
import React from "react"
import {useEffect, useState} from "react"


interface Task {
    id: number,
    amount: number,
    title: string,
    options: {
        id: number,
        image_url: string,
        taskId: number
    }[]
}

export default function NextTask() {
    const [currentTask, setCurrentTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        setLoading(true);
         axios.get(`${BACKEND_URL}/worker/v1/nextTasks`, {
            headers: {
                Authorization: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTcyMzk5MzE3Nn0.p6c1HBn5fn1GlqmX0uzB71YDhL3AsEWSwpEwID_8G2E"
            }
         })
         .then(res => {
            setCurrentTask(res.data.tasks)
            setLoading(false)
         })
    }, [])

    if (loading) {
        return (
            <div>
                Loadin...
            </div>
        )
    }

    if (!currentTask) {
        return <div>
            Please come back later, we do not have any more tasks for you
        </div>
    }

    return (
        <div>
            <div className="text-2xl pt-20 flex justify-center">
                {currentTask.title}
            </div>
            <div className="flex justify-center gap-10 pt-8">
                {currentTask.options.map((option) => <Option key={option.id} onSelect={async () =>{
                    const response = await axios.post(`${BACKEND_URL}/worker/submission`, {
                        taskId: String(currentTask.id),
                        selection: String(option.id)
                    }, {
                        headers: {
                            Authorization: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTcyMzk5MzE3Nn0.p6c1HBn5fn1GlqmX0uzB71YDhL3AsEWSwpEwID_8G2E"
                        }
                    })

                    const nextTask = response.data.nextTask;
                    if (nextTask) {
                        setCurrentTask(nextTask)
                    }else {
                        setCurrentTask(null)
                    }
                }}   imageUrl={option.image_url} />)}
            </div>
        </div>
    )
}

const Option = ({onSelect, imageUrl}: {onSelect: () => void, key: number, imageUrl: string}) => {
    return (
        <div>
        <img onClick={onSelect} src={imageUrl} className="pt-2 w-96 rounded-md h-[30vh]" alt="" />
      </div>
    )
}
