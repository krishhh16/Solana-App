"use client";

// pages/index.js
import { useWallet } from "@solana/wallet-adapter-react";
import AppBar from "./components/AppBar";
import WalletNotConnected from "./components/WalletNotConnected";
import NextTask from "./components/NextTask"
export default function Home() {
  const wallet = useWallet();

  if (!wallet.connected) {
    return (
        <WalletNotConnected/>
    );
  }
  return (
    <div className="w-full h-screen">
      <AppBar/>

      <NextTask />
    </div>
  );
}
