"use client";

import AppBar from "@/app/components/AppBar";
import WalletNotConnected from "@/app/components/WalletNotConnected";
import { useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {BACKEND_URL} from "../../../utils/utils"

async function getTasksFromBackend(taskId: string) {
  const response = await axios.get(
    `${BACKEND_URL}/user/task?taskId=${taskId}`,
    {
      headers: {
        Authorization:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTcyNDAxNjQ1MX0._T58FEQ6RuKIpEGriTicNIWOSIli-Rt6Q50AEJpIle0",
      },
    }
  );
  console.log(response.data);
  return response.data;
}

function TaskId({ params: { taskId } }: { params: { taskId: string } }) {
    const {connected} = useWallet();
  const [result, setResult] = useState<
    Record<
      string,
      {
        count: number;
        tasks: {
          imageUrl: string;
        };
      }
    >
  >({});

  const [taskDetails, setTaskDetails] = useState<{ title?: string }>({});

  useEffect(() => {
    getTasksFromBackend(taskId).then((data) => {
      console.log("data: ", data);
      setResult(data.result);
      setTaskDetails(data.taskDetails);
    });
  }, [taskId]);

  if (!connected) {
    return (
        <WalletNotConnected/>
    )
  }

  return (
    <div>
      <AppBar />
      <div className="text-2xl pt-20 flex justify-center text-gray-200">
        {taskDetails ? (
          <h1 className="font-semibold">{taskDetails.title}</h1>
        ) : (
          <div className="bg-gray-800 text-red-500 p-4 rounded-lg shadow-md">
            NO TASK WITH THE SPECIFIED TASK ID EXISTS
          </div>
        )}
      </div>

      <div className="flex justify-center pt-8">
        {Object.keys(result || {}).map((taskId, ix) => (
          <Task
            key={ix}
            imageUrl={result[taskId].tasks.imageUrl}
            votes={result[taskId].count}
          />
        ))}
      </div>
    </div>
  );
}

function Task({
  imageUrl,
  votes,
  key,
}: {
  imageUrl: string;
  votes: number;
  key: number;
}) {
  return (
    <div key={key}>
      <img src={imageUrl} className="pt-2 w-96 rounded-md h-[30vh]" alt="" />
      <div className="flex justify-center">{votes}</div>
    </div>
  );
}

export default TaskId;
