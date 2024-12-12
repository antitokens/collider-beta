const API_URL = process.env.NEXT_PUBLIC_CF_WORKER_URL;

export const recordVote = async (walletAddress, option) => {
  const response = await fetch(`${API_URL}/vote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ walletAddress, option }),
  });

  if (!response.ok) {
    throw new Error("FAILED_TO_RECORD_VOTE");
  }

  return response.json();
};

export const hasVoted = async (walletAddress) => {
  const response = await fetch(`${API_URL}/check/${walletAddress}`);
  return response.ok && (await response.json()).hasVoted;
};
