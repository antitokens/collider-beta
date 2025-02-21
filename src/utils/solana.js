import * as anchor from "@coral-xyz/anchor";
import { BN } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, Keypair, Connection } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { ANTITOKEN_MULTISIG } from "./utils";

const endpoint = process.env.NEXT_PUBLIC_SOL_RPC;
const connection = new Connection(endpoint);

// Token Programs
export const ANTI_TOKEN_MINT = new PublicKey(
  process.env.NEXT_PUBLIC_ANTI_TOKEN_MINT
);
export const PRO_TOKEN_MINT = new PublicKey(
  process.env.NEXT_PUBLIC_PRO_TOKEN_MINT
);

/// Core functions
/**
 * Derives PDAs using the given poll index and the program ID.
 * @param {object} program - The Anchor program instance.
 * @param {BN} pollIndex - The poll index (BN).
 * @returns {Object} An object containing the PDAs.
 */
export function derivePDAs(program, pollIndex) {
  const [adminPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("admin")],
    program.programId
  );
  const [statePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("state")],
    program.programId
  );
  const [pollPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("poll"), pollIndex.toArrayLike(Buffer, "le", 8)],
    program.programId
  );
  const [pollAntiTokenPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("anti_token"), pollIndex.toArrayLike(Buffer, "le", 8)],
    program.programId
  );
  const [pollProTokenPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("pro_token"), pollIndex.toArrayLike(Buffer, "le", 8)],
    program.programId
  );
  return { adminPda, statePda, pollPda, pollAntiTokenPda, pollProTokenPda };
}

/**
 * Creates a new poll on-chain.
 * @param {object} program - The Anchor program instance.
 * @param {object} predictionConfig - Contains title, description, startTime, endTime, fixedTimestamp (BN).
 * @param {Keypair} creator - The keypair signing the transaction.
 * @returns {Promise<string>} The transaction signature.
 */
export async function createPrediction(program, predictionConfig, creator) {
  const { index, title, description, startTime, endTime } = predictionConfig;
  let pollIndex = new BN(index);
  const { statePda, pollPda, pollAntiTokenPda, pollProTokenPda } = derivePDAs(
    program,
    pollIndex
  );

  const accounts = {
    state: statePda,
    poll: pollPda,
    authority: creator.publicKey,
    pollAntiToken: pollAntiTokenPda,
    pollProToken: pollProTokenPda,
    antiMint: ANTI_TOKEN_MINT,
    proMint: PRO_TOKEN_MINT,
    vault: ANTITOKEN_MULTISIG,
    tokenProgram: TOKEN_PROGRAM_ID,
    systemProgram: SystemProgram.programId,
  };

  return await program.methods
    .createPoll(title, description, startTime, endTime, null)
    .accounts(accounts)
    .rpc();
}

/**
 * Deposits tokens into an existing poll.
 * @param {object} program - The Anchor program instance.
 * @param {object} depositConfig - Contains pollIndex (BN), anti (BN), pro (BN), depositTimestamp (BN), userAntiToken, userProToken (public keys).
 * @param {Keypair} user - The user's keypair signing the transaction.
 * @returns {Promise<string>} The transaction signature.
 */
export async function depositTokens(program, depositConfig, user) {
  const {
    pollIndex,
    anti,
    pro,
    depositTimestamp,
    userAntiToken,
    userProToken,
  } = depositConfig;
  const { pollPda, pollAntiTokenPda, pollProTokenPda } = derivePDAs(
    program,
    pollIndex
  );

  const accounts = {
    poll: pollPda,
    authority: user.publicKey,
    userAntiToken: userAntiToken,
    userProToken: userProToken,
    pollAntiToken: pollAntiTokenPda,
    pollProToken: pollProTokenPda,
    tokenProgram: TOKEN_PROGRAM_ID,
  };

  return await program.methods
    .depositTokens(pollIndex, anti, pro, depositTimestamp)
    .accounts(accounts)
    .rpc();
}

/**
 * Withdraws tokens from a poll after equalisation.
 * @param {object} program - The Anchor program instance.
 * @param {BN} pollIndexValue - The poll index (BN).
 * @param {Array} remainingAccounts - An array of additional account objects (e.g., user token accounts).
 * @param {Array} signers - An array of signer keypairs required for the withdrawal.
 * @returns {Promise<string>} The transaction signature.
 */
export async function bulkWithdrawTokens(
  program,
  pollIndexValue,
  remainingAccounts
) {
  const { pollPda, pollAntiTokenPda, pollProTokenPda } = derivePDAs(
    program,
    pollIndexValue
  );

  const accounts = {
    poll: pollPda,
    authority: ANTITOKEN_MULTISIG,
    pollAntiToken: pollAntiTokenPda,
    pollProToken: pollProTokenPda,
    tokenProgram: TOKEN_PROGRAM_ID,
  };

  return await program.methods
    .bulkWithdrawTokens(pollIndexValue)
    .accounts(accounts)
    .remainingAccounts(remainingAccounts)
    .rpc();
}

/// Generic functions
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
