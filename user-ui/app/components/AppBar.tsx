import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import React, {useEffect} from 'react'
import axios from 'axios';
import { BACKEND_URL } from '@/utils/utils';

function AppBar() {
  const {publicKey, signMessage} = useWallet();

  async function signAndSend() {
    try {
      const message = new TextEncoder().encode(
        `You're a verified exceliWorker`
      );
      const signature = await signMessage?.(message);
      const response = await axios.post(`${BACKEND_URL}/user/v1/signin`, {
        signature,
        publicKey: publicKey?.toString()
      });

      localStorage.setItem("token", response.data.token)
    } catch (err) {
      alert("Unable to verify User")
      return
    }
  }

  useEffect(() => {
    signAndSend();
  }, [publicKey]);
  return (
    <div className="flex p-10  justify-between h-[10vh] items-center border-b-[1px]">
    <div>
      <h1 className="font-extrabold text-xl">
        ExcelliPost
      </h1>
    </div>
    <div className="flex gap-4 items-center">
      <h1 className="font-bold ">Connected Wallet :</h1>
      <WalletMultiButton style={{}} />
    </div>
  </div>
  )
}

export default AppBar