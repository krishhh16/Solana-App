"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
// pages/index.js
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import AppComponent from "./components/AppComponent";
import AppBar from "./components/AppBar";
import WalletNotConnected from "./components/WalletNotConnected";
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

      <AppComponent />
    </div>
  );
}
