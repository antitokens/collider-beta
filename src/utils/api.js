import { metaPlaceholder } from "../utils/utils";

const API_URL = process.env.NEXT_PUBLIC_CF_WORKER_URL;

export const recordVote = async (walletAddress, voteData) => {
  const response = await fetch(`${API_URL}/vote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      wallet: walletAddress,
      antiTokens: voteData.antiTokens,
      proTokens: voteData.proTokens,
      baryonTokens: voteData.baryonTokens,
      photonTokens: voteData.photonTokens,
      signature: voteData.signature,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text(); // Safely get the error message
    throw new Error(errorText || "FAILED_TO_RECORD_VOTE");
  }

  if (response.headers.get("Content-Type")?.includes("application/json")) {
    return response.json(); // Parse JSON if the response is JSON
  } else {
    return { message: await response.text() }; // Fallback for plain text responses
  }
};

export const recordClaim = async (walletAddress, claimData) => {
  const response = await fetch(`${API_URL}/claim`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      wallet: walletAddress,
      antiTokens: claimData.antiTokens,
      proTokens: claimData.proTokens,
      baryonTokens: claimData.baryonTokens,
      photonTokens: claimData.photonTokens,
      signature: claimData.signature,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text(); // Safely get the error message
    throw new Error(errorText || "FAILED_TO_RECORD_VOTE");
  }

  if (response.headers.get("Content-Type")?.includes("application/json")) {
    return response.json(); // Parse JSON if the response is JSON
  } else {
    return { message: await response.text() }; // Fallback for plain text responses
  }
};

// Get token balances from KV
export const getKVBalance = async (walletAddress) => {
  const response = await fetch(`${API_URL}/balances/${walletAddress}`);
  if (!response.ok) {
    throw new Error("FAILED_TO_GET_BALANCES");
  }
  return response.json();
};

// Get global data from API
export const getMetadata = async () => {
  const response = await fetch(`${API_URL}/metadata`);
  if (!response.ok) {
    return metaPlaceholder;
    //throw new Error(`HTTP_ERROR: ${response.status}`);
  }
  return response.json();
};
