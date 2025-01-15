/* API to web2 Database */

const API_URL = process.env.NEXT_PUBLIC_CF_WORKER_URL;

export const addPoll = async (walletAddress, config, poll) => {
  const response = await fetch(`${API_URL}/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      poll: poll,
      title: config.title,
      description: config.description,
      schedule: config.schedule,
      wallet: walletAddress,
      signature: config.signature,
      timestamp: config.timestamp,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text(); // Safely get the error message
    throw new Error(errorText || "FAILED_TO_ADD_POLL");
  }

  if (response.headers.get("Content-Type")?.includes("application/json")) {
    return response.json(); // Parse JSON if the response is JSON
  } else {
    return { message: await response.text() }; // Fallback for plain text responses
  }
};

export const recordPrediction = async (walletAddress, predict, poll) => {
  const response = await fetch(`${API_URL}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      poll: poll,
      wallet: walletAddress,
      antiTokens: predict.antiTokens,
      proTokens: predict.proTokens,
      baryonTokens: predict.baryonTokens,
      photonTokens: predict.photonTokens,
      signature: predict.signature,
      timestamp: predict.timestamp,
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
export const getBalance = async (walletAddress, poll) => {
  const response = await fetch(`${API_URL}/balance/${poll}/${walletAddress}`);
  if (!response.ok) {
    throw new Error("FAILED_TO_GET_BALANCES");
  }
  return response.json();
};

// Get global balances data from API
export const getBalances = async (poll) => {
  const response = await fetch(`${API_URL}/balances/${poll}`);
  if (!response.ok) {
    throw new Error(`HTTP_ERROR: ${response.status}`);
  }
  return response.json();
};

// Get polls data from API
export const getPolls = async () => {
  const response = await fetch(`${API_URL}/polls`);
  if (!response.ok) {
    throw new Error(`HTTP_ERROR: ${response.status}`);
  }
  return response.json();
};
