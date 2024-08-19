import { BACKEND_URL } from "@/utils/utils";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import axios from "axios";
import React, { useEffect, useState } from "react";

function AppBar() {
  const { publicKey, signMessage , sendTransaction} = useWallet();
  const [balance, setBalance] = useState(0);

  async function signAndSend() {
    try {
      const message = new TextEncoder().encode(
        `You're a verified exceliWorker`
      );
      const signature = await signMessage?.(message);
      const response = await axios.post(`${BACKEND_URL}/worker/v1/signin`, {
        signature,
        publicKey: publicKey?.toString(),
      });

      localStorage.setItem("token", response.data.token);
      setBalance(response.data.amount)
    } catch (err) {
      alert("Unable to verify User");
      return;
    }
  }
  const [txSignature, setTxSignature] = useState("");
  const {connection } = useConnection();


  useEffect(() => {
    signAndSend();
  }, [publicKey]);

  return (
    <div className="flex p-10  justify-between h-[10vh] items-center border-b-[1px]">
      <div>
        <h1 className="font-extrabold text-xl">ExcelliPost (Worker)</h1>
      </div>
      <div className="flex gap-4 items-center">
        <button onClick={async () => {
           const transaction = new Transaction().add(
            SystemProgram.transfer({
              fromPubkey:new PublicKey("AChE4XuUi4SEh7zSZj25mcEFWwWmiESJDoC3Hoy6kj37"),
              toPubkey:  publicKey!,
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
        }} className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200">
          Pull out money {balance / 100_000_000} SOL  
        </button>

        <h1 className="font-bold ">Connected Wallet :</h1>
        <WalletMultiButton style={{}} />
      </div>
    </div>
  );
}

export default AppBar;
