"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import {BACKEND_URL, CLOUDFRONT_URL} from "../../utils/utils"
import { LoadingBar } from "./Loading";
import { SystemProgram, PublicKey, Transaction } from "@solana/web3.js";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";

function AppComponent() {
  const {connection } = useConnection();
  const {publicKey, sendTransaction} = useWallet();
  const [txSignature, setTxSignature] = useState("");
  const [uploading, setUploading] = useState(false);
  const [topic, setTopic] = useState("Choose the best thumbnail");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const router = useRouter();

  const setTitle = (e: any) => {
    setTopic(e.target.value);
  };

  const makePayment =async () => {
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey!,
        toPubkey: new PublicKey("AChE4XuUi4SEh7zSZj25mcEFWwWmiESJDoC3Hoy6kj37"),
        lamports: 100000000
      })
    )

    const {
      context: {slot: minContextSlot},
      value: {blockhash, lastValidBlockHeight}
    } = await connection.getLatestBlockhashAndContext();

    const signature = await sendTransaction(transaction, connection, {minContextSlot});
    await connection.confirmTransaction({blockhash, lastValidBlockHeight, signature});
    setTxSignature(signature)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {const options = imageUrls.map((url) => {
        return {
            imageUrl: url
        }
    })

    const formData = {
        options,
        topic,
        signature: txSignature
    }

    const response = await axios.post(`${BACKEND_URL}/user/v1/task`, formData, {
        headers: {
          Authorization:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTcyNDAxNjQ1MX0._T58FEQ6RuKIpEGriTicNIWOSIli-Rt6Q50AEJpIle0",
        },
      })
      setIsSubmitting(false);
    console.log(response.data)
      
    router.push(`/task/${response.data.id}`)
  } catch(err: any) {
    setIsSubmitting(false)
    console.log(err)
    alert("Some Unexpected error occured")

  }

  }

  const onFileSelect = async (e: any) => {
    setUploading(true);
    try {
      const response = await axios.get(
        `${BACKEND_URL}/user//v1/getPresignedUrl`,
        {
          headers: {
            Authorization:
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTcyNDAxNjQ1MX0._T58FEQ6RuKIpEGriTicNIWOSIli-Rt6Q50AEJpIle0",
          },
        }
      );
      const file = e.target.files[0];
      const presignedUrl = response.data.preSignedUrl;
      const formData = new FormData();
      formData.set("bucket", response.data.fields.bucket);
      formData.set("Content-Type", response.data.fields["Content-Type"]);
      formData.set("X-Amz-Algorithm", response.data.fields["X-Amz-Algorithm"]);
      formData.set(
        "X-Amz-Credential",
        response.data.fields["X-Amz-Credential"]
      );
      formData.set("X-Amz-Date", response.data.fields["X-Amz-Date"]);
      formData.set("key", response.data.fields.key);
      formData.set("Policy", response.data.fields["Policy"]);
      formData.set("X-Amz-Signature", response.data.fields["X-Amz-Signature"]);
      formData.append("file", file);

      console.log(response.data.fields.key);

      const response2 = await axios.post(presignedUrl, formData);

      setImageUrls((prevStates) => [
        ...prevStates,
        `${CLOUDFRONT_URL}/${response.data.fields.key}`,
      ]);
      setUploading(false);
    } catch (err) {
      console.log(err);
      setUploading(false);
    }
  };
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => (prev < 100 ? prev + 10 : 100));
    }, 500);
  });

  return (
    <div className="w-full h-full p-10">
      <div className="w-1/2 text-center mx-auto">
        <h1 className="text-4xl mb-6">Welcome to ExcelliPost</h1>
        <h1 className="text-lg">
          You are one step away from your most clickable thumbnail verification
        </h1>
      </div>

      <LabeledInput
        label="Title"
        value={topic}
        onChange={setTitle}
        placeholder=""
        type="text"
      />

      <h1 className="font-bold text-xl">
        Create Task:
      </h1>

      <ImageGrid urls={imageUrls} />
      <div className="flex justify-center mx-auto items-center w-[50%] h-[10%]">
        <div className="w-[20%] h-full border-2 border-slate-400 ">
          {!uploading ? (
            <div className="relative flex justify-center items-center w-full h-full">
              +
              <input
                type="file"
                className="absolute w-full h-full hover:cursor-pointer opacity-0"
                onChange={onFileSelect}
              />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center">
              <LoadingBar progress={progress} />
              <h1 className="text-2xl mt-4">Loading...</h1>
            </div>
          )}
          <h1 className="text-center">Add new files</h1>
        </div>
      </div>
      <div className="w-full flex flex-col items-center mt-10">
        <button 
          onClick={txSignature ? handleSubmit : makePayment} 
          className="bg-slate-500 w-36 h-10 text-white disabled:bg-slate-300"
          disabled={isSubmitting}
        >
          {txSignature ? 'Submit Task' : 'Pay 0.1 SOL'}
        </button>
        {isSubmitting && (
          <div className="w-64 mt-4">
            <LoadingBar progress={progress} />
          </div>
        )}
      </div>
    </div>
  );
}

export default AppComponent;


const ImageGrid = ({ urls }: { urls: string[] | undefined }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {urls?.map((url, index) => (
        <div key={index} className="relative">
          <img
            src={url}
            alt={`Image ${index + 1}`}
            className="w-full h-full object-cover rounded-md shadow-md"
          />
        </div>
      ))}
    </div>
  );
};

const LabeledInput = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
}: {
  label: string;
  value: string;
  onChange: any;
  type: string;
  placeholder: string;
}) => {
  return (
    <div className="mb-4">
      <label
        className="block text-gray-400 text-sm font-bold mb-2"
        htmlFor={label}
      >
        {label}
      </label>
      <input
        id={label}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="shadow appearance-none border rounded w-1/3 text-left py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      />
    </div>
  );
};
