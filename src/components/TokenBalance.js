import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { ANTI_TOKEN_MINT, getTokenBalance, PRO_TOKEN_MINT } from "../utils/solana";

const TokenBalance = () => {
  const wallet = useWallet()
  const [antiBalance, setAntiBalance] = useState(0)
  const [proBalance, setProBalance] = useState(0)

  useEffect(() => {
    const checkBalance = async () => {
      const [antiBalanceResult, proBalanceResult] = await Promise.all(
        [
          getTokenBalance(wallet.publicKey, ANTI_TOKEN_MINT),
          getTokenBalance(wallet.publicKey, PRO_TOKEN_MINT)
        ]
      )
      setAntiBalance(antiBalanceResult)
      setProBalance(proBalanceResult)
    }
    if (wallet.publicKey) checkBalance()
  }, [wallet])

  if (!wallet.publicKey)
    return
  return <div className="flex flex-col items-end text-gray-300 text-sm py-1">
    <div><b>$ANTI:</b> {antiBalance ? antiBalance.toFixed(2) : '-'}</div>
    <div><b>$PRO:</b> {proBalance ? proBalance.toFixed(2) : '-'}</div>
  </div>
};

export default TokenBalance;
