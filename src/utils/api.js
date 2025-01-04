const API_URL = process.env.NEXT_PUBLIC_CF_WORKER_URL;

export const recordPrediction = async (walletAddress, voteData) => {
  const response = await fetch(`${API_URL}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      wallet: walletAddress,
      antiTokens: voteData.antiTokens,
      proTokens: voteData.proTokens,
      baryonTokens: voteData.baryonTokens,
      photonTokens: voteData.photonTokens,
      signature: voteData.signature,
      timestamp: voteData.timestamp,
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
      timestamp: claimData.timestamp,
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

// Get token balances from KV for a wallet
export const getBalance = async (walletAddress) => {
  const response = await fetch(`${API_URL}/balance/${walletAddress}`);
  if (!response.ok) {
    throw new Error("FAILED_TO_GET_BALANCES");
  }
  return response.json();
};

// Get token claims from KV for a wallet
export const getClaim = async (walletAddress) => {
  const response = await fetch(`${API_URL}/claim/${walletAddress}`);
  if (!response.ok) {
    throw new Error("FAILED_TO_GET_CLAIMS");
  }
  return response.json();
};

// Get global balances data from API
export const getBalances = async () => {
  const response = await fetch(`${API_URL}/balances`);
  if (!response.ok) {
    throw new Error(`HTTP_ERROR: ${response.status}`);
  }
  return response.json();
};

// Get global claims data from API
export const getClaims = async () => {
  const response = await fetch(`${API_URL}/claims`);
  if (!response.ok) {
    throw new Error(`HTTP_ERROR: ${response.status}`);
  }
  return response.json();
};
