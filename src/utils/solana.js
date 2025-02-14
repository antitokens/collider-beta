import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

// Creates a new poll on-chain.
// pollDetails should include:
//   - title (string)
//   - description (string)
//   - startTime (string, e.g., ISO date)
//   - endTime (string, e.g., ISO date)
//   - fixedTimestamp (BN, a fixed timestamp for testing or use-case)
export async function createPoll(
  program,
  pollDetails,
  accounts,
  creatorSigner
) {
  const { title, description, startTime, endTime, fixedTimestamp } =
    pollDetails;

  // The accounts object should contain:
  // {
  //   state: statePda,
  //   poll: pollPda,
  //   authority: creatorPublicKey,
  //   pollAntiToken: pollAntiTokenPda,
  //   pollProToken: pollProTokenPda,
  //   antiMint: antiMintPublicKey,
  //   proMint: proMintPublicKey,
  //   vault: vaultPublicKey,
  //   tokenProgram: TOKEN_PROGRAM_ID,
  //   systemProgram: SystemProgram.programId,
  // }
  return await program.methods
    .createPoll(title, description, startTime, endTime, null, fixedTimestamp)
    .accounts(accounts)
    .signers([creatorSigner])
    .rpc();
}

// Deposits tokens into an existing poll.
// depositDetails should include:
//   - pollIndex (BN)
//   - anti (BN): amount of anti tokens to deposit
//   - pro (BN): amount of pro tokens to deposit
//   - depositTimestamp (BN)
export async function depositTokens(
  program,
  depositDetails,
  accounts,
  userSigner
) {
  const { pollIndex, anti, pro, depositTimestamp } = depositDetails;

  // The accounts object should contain:
  // {
  //   poll: pollPda,
  //   authority: userPublicKey,
  //   userAntiToken: userAntiTokenAddress,
  //   userProToken: userProTokenAddress,
  //   pollAntiToken: pollAntiTokenPda,
  //   pollProToken: pollProTokenPda,
  //   tokenProgram: TOKEN_PROGRAM_ID,
  // }
  return await program.methods
    .depositTokens(pollIndex, anti, pro, depositTimestamp)
    .accounts(accounts)
    .signers([userSigner])
    .rpc();
}

// Withdraws tokens from a poll after equalisation.
// remainingAccounts is an array of additional account objects (for writable token accounts).
// signers is an array of signer objects needed for the withdrawal.
export async function withdrawTokens(
  program,
  pollIndex,
  accounts,
  remainingAccounts,
  signers
) {
  // The accounts object should contain:
  // {
  //   poll: pollPda,
  //   authority: vaultPublicKey, // e.g. the multisig or admin authority
  //   pollAntiToken: pollAntiTokenPda,
  //   pollProToken: pollProTokenPda,
  //   tokenProgram: TOKEN_PROGRAM_ID,
  // }
  return await program.methods
    .bulkWithdrawTokens(pollIndex)
    .accounts(accounts)
    .remainingAccounts(remainingAccounts)
    .signers(signers)
    .rpc();
}

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
