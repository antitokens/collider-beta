import { useState } from "react";
import { checkTokenBalance } from "../utils/solana";
import { recordVote, hasVoted } from "../utils/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const VoteOption = ({ wallet, antiBalance, proBalance, disabled }) => {
  const [loading, setLoading] = useState(false);
  const [antiTokens, setAntiTokens] = useState(0);
  const [proTokens, setProTokens] = useState(0);

  const handleVote = async () => {
    if (disabled || loading) return;

    try {
      setLoading(true);

      // Validate input
      if (antiTokens <= 0 && proTokens <= 0) {
        toast.error("You must vote with at least some Anti or Pro tokens!");
        return;
      }

      if (antiTokens > antiBalance || proTokens > proBalance) {
        toast.error("You cannot vote with more tokens than you have!");
        return;
      }

      // Check if the user has already voted
      if (await hasVoted(wallet.toString())) {
        toast.error("You have already voted!");
        return;
      }

      // Prompt for Solana signature
      const message = `Requesting signature to vote with ${antiTokens} Anti and ${proTokens} Pro tokens with account ${wallet.toString()}`;
      const signature = await wallet.signMessage(
        new TextEncoder().encode(message)
      );

      // Record the vote
      await recordVote(wallet.toString(), {
        antiTokens,
        proTokens,
        signature,
      });
      toast.success("Your vote has been recorded!");
    } catch (error) {
      console.error("VOTE_SUBMISSION_FAILED:", error);
      toast.error("An error occurred while recording your vote.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full space-y-6">
      <div className="flex justify-center space-x-6">
        <div className="flex flex-col items-center">
          <label htmlFor="antiTokens" className="text-accent-primary font-medium">
            $ANTI
          </label>
          <input
            id="antiTokens"
            type="number"
            min="0"
            max={antiBalance}
            value={antiTokens}
            onChange={(e) => setAntiTokens(Number(e.target.value))}
            placeholder="0"
            className="px-3 py-2 border rounded-lg w-32 text-gray-700 text-center font-sfmono"
          />
        </div>
        <div className="flex flex-col items-center">
          <label htmlFor="proTokens" className="text-accent-secondary font-medium">
            $PRO
          </label>
          <input
            id="proTokens"
            type="number"
            min="0"
            max={proBalance}
            value={proTokens}
            onChange={(e) => setProTokens(Number(e.target.value))}
            placeholder="0"
            className="px-3 py-2 border rounded-lg w-32 text-gray-700 text-center font-sfmono"
          />
        </div>
      </div>
      <button
        onClick={handleVote}
        disabled={disabled || loading}
        className={`w-40 px-5 py-3 rounded-lg font-semibold text-lg transition-all ${
          disabled || loading
            ? "bg-gray-500 text-gray-300 cursor-not-allowed"
            : "bg-accent-primary text-white hover:bg-accent-secondary hover:text-black"
        }`}
      >
        {loading ? "Submitting..." : "Submit Vote"}
      </button>
      <ToastContainer />
    </div>
  );
};

export default VoteOption;
