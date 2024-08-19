"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
// pages/index.js
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import AppComponent from "./components/AppComponent";
import AppBar from "./components/AppBar";
export default function Home() {
  const wallet = useWallet();

  if (!wallet.connected) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-3xl font-bold mb-6 text-center text-white">
            Welcome to Our Solana App
          </h1>

          <div className="text-center">
            <p className="mb-6 text-gray-400">
              Please connect your Solana wallet to use the application features.
            </p>
            <div className="hover:border-slate-900 rounded">
              <WalletMultiButton style={{}} />
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="w-full h-screen">
      <AppBar/>

      <AppComponent />
    </div>
  );
}
