'use client'

import AppBar from '@/app/components/AppBar';
import axios from 'axios';
import React, { useEffect, useState } from 'react'

async function getTasksFromBackend(taskId: string) {
    const response = await axios.get(`http://localhost:3001/user/task?taskId=${taskId}`, {
        headers: {
            "Authorization": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTcyNDAxNjQ1MX0._T58FEQ6RuKIpEGriTicNIWOSIli-Rt6Q50AEJpIle0"
        }
    })
    console.log(response.data)
    return response.data;
}

function TaskId({params: {taskId}}: {params: {taskId: string}}) {
    const [result, setResult] = useState<Record<string, {
        count: number,
        option: {
            imageUrl: string
        }
    }>>({});
  
    const [taskDetails, setTaskDetails] = useState<{title?: string}>({})

    useEffect(() => {
        getTasksFromBackend(taskId)
        .then(data => {
            console.log("data: ", data)
            setResult(data.result)
            setTaskDetails(data.taskDetails)
        })
    }, [taskId])

    return (
    <div>
        <AppBar/>
        <div className="text-2xl pt-20 flex justify-center">
            {taskDetails.title}
        </div>
        <div className= "flex justify-center pt-8">
            {Object.keys(result || {}).map(taskId => <Task imageUrl={result[taskId].option.imageUrl} votes={result[taskId].count} />)}
        </div>

    </div>
  )
}


function Task({imageUrl, votes}: {imageUrl: string, votes: number}) {
    return (
        <div>
            <img src={imageUrl} className="pt-2 w-96 rounded-md" alt="" />
            <div className="flex justify-center">
                {votes}
            </div>
        </div>
    )
}


export default TaskId