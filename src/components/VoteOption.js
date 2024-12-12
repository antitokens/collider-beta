import { useState, useEffect } from "react";
import { recordVote, hasVoted } from "../utils/api";
import { calculateDistribution } from "../utils/colliderAlpha";
import { ToastContainer, toast } from "react-toastify";
import { Chart, registerables } from "chart.js";
import { Pie, Bar, Line } from "react-chartjs-2";
import "react-toastify/dist/ReactToastify.css";
Chart.register(...registerables);

const VoteOption = ({ wallet, antiBalance, proBalance, disabled }) => {
  const [loading, setLoading] = useState(false);
  const [antiTokens, setAntiTokens] = useState(0);
  const [proTokens, setProTokens] = useState(0);
  const [userDistribution, setUserDistribution] = useState(null);
  const [lineChartData, setLineChartData] = useState(null);

  // Prepare line chart data
  useEffect(() => {
    if (userDistribution) {
      setLineChartData({
        type: "line",
        labels:
          antiTokens !== proTokens || antiTokens > 0 || proTokens > 0
            ? userDistribution.range.map((value) =>
                value ? value.toFixed(2) : ""
              )
            : "",
        datasets: [
          {
            label: "",
            data: userDistribution.distribution.map((item) => item.value),
            borderColor: "#FF9500",
            backgroundColor: "#FF9500", // Match the legend marker color
            pointStyle: "line",
          },
        ],
        options: {
          responsive: true,
          plugins: {
            legend: {
              labels: {
                font: {
                  family: "'SF Mono Round'",
                },
                color: "#FFFFFFA2",
              },
              display: false,
            },
          },
          scales: {
            x: {
              ticks: {
                font: {
                  family: "'SF Mono Round'",
                  size: 10,
                },
              },
              grid: {
                color: antiTokens !== proTokens ? "#D3D3D322" : "D3D3D300",
              },
            },
            y: {
              grid: { color: "#D3D3D322" },
              ticks: {
                callback: function (value) {
                  return ""; // Format y-axis
                },
              },
            },
          },
        },
      });
    }
  }, [userDistribution, antiTokens, proTokens]);

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

  useEffect(() => {
    if (antiTokens || proTokens) {
      const distribution = calculateDistribution(antiTokens, proTokens);
      setUserDistribution(distribution);
    } else {
      setUserDistribution({
        u: 0,
        s: 0,
        range: [0, 1],
        distribution: [
          { x: 0, value: 0 },
          { x: 1, value: 0 },
        ],
      });
    }
  }, [antiTokens, proTokens]);

  return (
    <div className="flex flex-col items-center justify-center w-full space-y-6">
      {/* User Distribution */}
      {userDistribution && (
        <>
          <div className="text-center mt-4">
            <p className="text-lg text-gray-300 mb-1">Collider Emissions</p>
            <span className="text-accent-primary">$BARYON</span>:&nbsp;
            <span className="font-bold text-md text-accent-primary font-sfmono">
              {userDistribution.u.toFixed(2)}
            </span>
            <br />
            <span className="text-accent-secondary">$PHOTON</span>:&nbsp;
            <span className="font-bold text-md text-accent-secondary font-sfmono">
              {userDistribution.s !== 0
                ? (1 / userDistribution.s).toFixed(2)
                : (0).toFixed(2)}
            </span>
          </div>
          {lineChartData && (
            <Line data={lineChartData} options={lineChartData.options} />
          )}
        </>
      )}

      {/* Token Input Fields */}
      <div className="flex flex-row items-center justify-between space-x-10">
        <div className="flex flex-col items-start">
          <label
            htmlFor="antiTokens"
            className="text-accent-orange font-medium text-lg"
          >
            $ANTI
          </label>
          <div className="flex flex-col items-start">
            <input
              id="antiTokens"
              type="number"
              min="0"
              max={antiBalance}
              value={antiTokens}
              onChange={(e) => setAntiTokens(Number(e.target.value))}
              placeholder="0"
              className="px-3 py-2 border border-gray-400 rounded-md w-32 text-gray-700 text-center font-sfmono bg-black text-white"
            />
            <p className="text-sm">
              Max: <span className="font-sfmono">{antiBalance.toFixed(0)}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <label
            htmlFor="proTokens"
            className="text-accent-secondary font-medium text-lg"
          >
            $PRO
          </label>
          <div className="flex flex-col items-end">
            <input
              id="proTokens"
              type="number"
              min="0"
              max={proBalance}
              value={proTokens}
              onChange={(e) => setProTokens(Number(e.target.value))}
              placeholder="0"
              className="px-3 py-2 border border-gray-400 rounded-md w-32 text-gray-700 text-center font-sfmono bg-black text-white"
            />
            <p className="text-sm">
              Max: <span className="font-sfmono">{proBalance.toFixed(0)}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Submit Button */}
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
