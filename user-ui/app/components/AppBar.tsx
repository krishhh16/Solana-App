import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import React from 'react'

function AppBar() {
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