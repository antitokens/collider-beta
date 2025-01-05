import { Connection, PublicKey } from "@solana/web3.js";

/* Solana API */
const endpoint = process.env.NEXT_PUBLIC_SOL_RPC;
const connection = new Connection(endpoint);

// Token Programs
export const ANTI_TOKEN_MINT = new PublicKey(
  process.env.NEXT_PUBLIC_ANTI_TOKEN_MINT
);
export const PRO_TOKEN_MINT = new PublicKey(
  process.env.NEXT_PUBLIC_PRO_TOKEN_MINT
);

export const getTokenBalance = async (walletPublicKey, mint) => {
  const accounts = walletPublicKey
    ? await connection.getParsedTokenAccountsByOwner(walletPublicKey, { mint })
    : {};
  return (
    accounts.value?.reduce((memo, item) => {
      return memo + (item?.account?.data.parsed.info.tokenAmount.uiAmount || 0);
    }, 0) || 0
  );
};

export const checkTokenBalance = async (walletPublicKey, mint) => {
  const balance = await getTokenBalance(walletPublicKey, mint);
  return balance > 0;
};
