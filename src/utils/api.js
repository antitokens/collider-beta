/* API to web2 Database */
const API_URL = process.env.NEXT_PUBLIC_CF_WORKER_URL;

export const addPrediction = async (wallet, config, prediction) => {
  const response = await fetch(`${API_URL}/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prediction: prediction,
      title: config.title,
      description: config.description,
      schedule: [config.startTime, config.endTime],
      wallet: wallet,
      signature: config.signature,
      timestamp: config.timestamp,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text(); // Safely get the error message
    throw new Error(errorText || "FAILED_TO_ADD_PREDICTION");
  }

  if (response.headers.get("Content-Type")?.includes("application/json")) {
    return response.json(); // Parse JSON if the response is JSON
  } else {
    return { message: await response.text() }; // Fallback for plain text responses
  }
};

export const recordPrediction = async (wallet, config, prediction) => {
  const response = await fetch(`${API_URL}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prediction: prediction,
      wallet: wallet,
      anti: config.anti,
      pro: config.pro,
      baryon: config.baryon,
      photon: config.photon,
      signature: config.signature,
      timestamp: config.timestamp,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text(); // Safely get the error message
    throw new Error(errorText || "FAILED_TO_RECORD_PREDICTION");
  }

  if (response.headers.get("Content-Type")?.includes("application/json")) {
    return response.json(); // Parse JSON if the response is JSON
  } else {
    return { message: await response.text() }; // Fallback for plain text responses
  }
};

export const recordWithdrawal = async (wallet, config, prediction) => {
  const response = await fetch(`${API_URL}/withdraw`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prediction: prediction,
      wallet: wallet,
      anti: config.anti,
      pro: config.pro,
      baryon: config.baryon,
      photon: config.photon,
      signature: config.signature,
      timestamp: config.timestamp,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text(); // Safely get the error message
    throw new Error(errorText || "FAILED_TO_RECORD_PREDICTION");
  }

  if (response.headers.get("Content-Type")?.includes("application/json")) {
    return response.json(); // Parse JSON if the response is JSON
  } else {
    return { message: await response.text() }; // Fallback for plain text responses
  }
};

// Get token balances from KV for a wallet
export const getBalance = async (wallet, prediction) => {
  const response = await fetch(`${API_URL}/balance/${prediction}/${wallet}`);
  if (!response.ok) {
    throw new Error(`FAILED_TO_GET_BALANCE: ${response.status}`);
  }
  return response.json();
};

// Get token withdrawals from KV for a wallet
export const getWithdrawal = async (wallet, prediction) => {
  const response = await fetch(`${API_URL}/withdrawal/${prediction}/${wallet}`);
  if (!response.ok) {
    throw new Error(`FAILED_TO_GET_WITHDRAWAL: ${response.status}`);
  }
  return response.json();
};

// Get global balances data from API
export const getBalances = async (prediction) => {
  const response = await fetch(`${API_URL}/balances/${prediction}`);
  if (!response.ok) {
    throw new Error(`FAILED_TO_GET_BALANCES: ${response.status}`);
  }
  return response.json();
};

// Get global withdrawals data from API
export const getWithdrawals = async (prediction) => {
  const response = await fetch(`${API_URL}/withdrawals/${prediction}`);
  if (!response.ok) {
    throw new Error(`FAILED_TO_GET_WITHDRAWALS: ${response.status}`);
  }
  return response.json();
};

// Get predictions data from API
export const getPredictions = async () => {
  const response = await fetch(`${API_URL}/predictions`);
  if (!response.ok) {
    throw new Error(`FAILED_TO_GET_PREDICTIONS: ${response.status}`);
  }
  return response.json();
};

// Check posted status from API
export const checkPredictions = async (wallet) => {
  const response = await fetch(`${API_URL}/check/${wallet}`);
  if (!response.ok) {
    throw new Error(`FAILED_TO_CHECK_PREDICTIONS: ${response.status}`);
  }
  return response.json();
};
