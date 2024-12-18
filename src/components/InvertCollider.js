import { useState, useEffect } from "react";
import { recordClaim, hasVoted } from "../utils/api";
import { calculateDistribution } from "../utils/colliderAlpha";
import { ToastContainer, toast } from "react-toastify";
import { Chart, registerables } from "chart.js";
import { Pie, Bar, Line } from "react-chartjs-2";
import "react-toastify/dist/ReactToastify.css";
import { color } from "chart.js/helpers";
Chart.register(...registerables);

const InvertCollider = ({
  wallet,
  antiBalance,
  proBalance,
  baryonBalance,
  photonBalance,
  disabled,
  BASE_URL,
  onClaimSubmitted,
  clearFields,
}) => {
  const [loading, setLoading] = useState(false);
  const [antiTokens, setAntiTokens] = useState(0);
  const [proTokens, setProTokens] = useState(0);
  const [baryonTokens, setBaryonTokens] = useState(0);
  const [photonTokens, setPhotonTokens] = useState(0);
  const [userDistribution, setUserDistribution] = useState(null);
  const [lineChartData, setLineChartData] = useState(null);

  // Clear input fields when `clearFields` changes
  useEffect(() => {
    if (clearFields) {
      setAntiTokens(0);
      setProTokens(0);
      setBaryonTokens(0);
      setPhotonTokens(0);
    }
  }, [clearFields]);

  // Prepare line chart data
  useEffect(() => {
    if (userDistribution) {
      // Trial
      const F = (baryonTokens + photonTokens) / 2;
      const G = (baryonTokens + photonTokens) / 2;

      setAntiTokens((F * (1 * userDistribution.u)).toFixed(2));
      setProTokens((G * (1 / userDistribution.s)).toFixed(2));
      setLineChartData({
        type: "line",
        labels:
          baryonTokens !== photonTokens || baryonTokens > 0 || photonTokens > 0
            ? userDistribution.range.map((value) =>
                value ? value.toFixed(2) : ""
              )
            : "",
        datasets: [
          {
            label: "Inverter",
            data: userDistribution.distribution.map((item) => item.value),
            borderColor: "#FFFFFF",
            backgroundColor: "#FFFFFF", // Match the legend marker color
            pointStyle: "line",
          },
          {
            label: "Reclaimer",
            data: userDistribution.curve.map((item) => item.value),
            borderColor: "#a6a6a6",
            backgroundColor: "#a6a6a6", // Match the legend marker color
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
              display: true,
              position: "top",
              align: "end",
            },
          },
          layout: {
            padding: {
              top: 20, // Add padding to avoid overlapping
              left: 20,
              right: 20,
              bottom: 0,
            },
          },
          scales: {
            x: {
              position: "bottom",
              title: {
                display: true,
                text: "Probability Range", // Label for the X-axis
                font: {
                  family: "'SF Mono Round'",
                  size: 14,
                  weight: "bold",
                },
                color: "#808080",
              },
              ticks: {
                font: {
                  family: "'SF Mono Round'",
                  size: 10,
                },
                color: "#FFFFFF",
              },
              grid: {
                color: baryonTokens !== photonTokens ? "#D3D3D322" : "D3D3D300",
              },
            },
            x2: {
              position: "top",
              title: {
                display: false,
                text: "Probability Range", // Label for the X-axis
                font: {
                  family: "'SF Mono Round'",
                  size: 14,
                  weight: "bold",
                },
                color: "#808080",
              },
              ticks: {
                callback: function (value, index) {
                  // Map index to a new labels array for the second axis
                  const range2 = userDistribution.short;
                  return range2[index].toFixed(2);
                },
                font: {
                  family: "'SF Mono Round'",
                  size: 10,
                },
                color: "#a6a6a6",
              },
              grid: {
                color: baryonTokens !== photonTokens ? "#D3D3D322" : "D3D3D300",
              },
            },
            y: {
              title: {
                display: true,
                text: "Reclaim", // Label for the X-axis
                font: {
                  family: "'SF Mono Round'",
                  size: 14,
                  weight: "bold",
                },
                color: "#808080",
              },
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
  }, [userDistribution, baryonTokens, photonTokens]);

  const handleReclaim = async () => {
    if (disabled || loading) return;

    try {
      setLoading(true);

      // Validate input
      if (baryonTokens <= 0 && photonTokens <= 0) {
        toast.error("You must vote with at least some tokens!");
        return;
      }

      if (baryonTokens > baryonBalance || photonTokens > photonBalance) {
        toast.error("You cannot vote with more tokens than you have!");
        return;
      }

      // Check if the user has already voted
      /*
      if (await hasVoted(wallet.publicKey.toString())) {
        toast.error("You have already voted!");
        return;
      }
      */

      // Prompt for Solana signature
      const message = `Requesting signature to claim with:
        ${baryonTokens} $BARYON,
        ${photonTokens} $PHOTON,
        for
        ${baryonTokens} $ANTI,
        ${photonTokens} $PRO
        with account ${wallet.publicKey.toString()}`;
      const signatureUint8Array = await wallet.signMessage(
        new TextEncoder().encode(message)
      );
      const signature = btoa(String.fromCharCode(...signatureUint8Array));

      // Record the vote
      await recordClaim(wallet.publicKey.toString(), {
        antiTokens,
        proTokens,
        baryonTokens,
        photonTokens,
        signature,
      });
      // Emit the updated data
      onClaimSubmitted(true);
      toast.success("Your claim has been recorded!");
    } catch (error) {
      console.error("CLAIM_SUBMISSION_FAILED:", error);
      toast.error("An error occurred while recording your claim.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (baryonTokens || photonTokens) {
      const distribution = calculateDistribution(baryonTokens, photonTokens);
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
        short: [0, 1],
        curve: [
          { x: 0, value: 0 },
          { x: 1, value: 0 },
        ],
      });
    }
  }, [baryonTokens, photonTokens]);

  return (
    <div className="flex flex-col items-center justify-center w-full">
      {/* Emission Input */}

      <div className="flex flex-row items-center justify-between bg-dark-card w-full p-4 rounded gap-2">
        <div className="flex flex-col items-start w-full">
          <div className="flex flex-row items-center gap-2 bg-black px-3 py-2 rounded w-full">
            <label
              htmlFor="photonTokens"
              className="text-accent-secondary font-medium text-xs sm:text-sm"
            >
              $tPHOTON
            </label>
            <span className="border-l border-gray-400/50 h-[0.8rem]"></span>
            <input
              id="photonTokens"
              type="number"
              min="0"
              max={photonBalance}
              value={photonTokens.toFixed(2)}
              onChange={(e) => setPhotonTokens(Number(e.target.value))}
              onFocus={(e) => e.target.select()}
              placeholder="0"
              className="text-gray-700 font-sfmono bg-black text-white text-xs sm:text-sm w-full"
            />
          </div>
          <p className="text-sm flex flex-row">
            <img
              src={`${BASE_URL}/assets/photon.png`}
              alt="photon-logo"
              className="w-5 h-5 inline-block"
            />
            <span className="font-sfmono text-sm">
              MAX:&nbsp;
              <span className="font-sfmono text-accent-secondary text-sm">
                {Number(photonBalance).toFixed(2)}
              </span>
            </span>
          </p>
        </div>

        <div className="flex flex-col items-end w-full">
          <div className="flex flex-row items-center gap-2 bg-black px-3 py-2 rounded w-full">
            <label
              htmlFor="baryonTokens"
              className="text-accent-orange font-medium text-xs sm:text-sm"
            >
              $tBARYON
            </label>
            <span className="border-l border-gray-400/50 h-[0.8rem]"></span>
            <input
              id="baryonTokens"
              type="number"
              min="0"
              max={baryonBalance}
              value={baryonTokens.toFixed(2)}
              onChange={(e) => setBaryonTokens(Number(e.target.value))}
              onFocus={(e) => e.target.select()}
              placeholder="0"
              className="w-full text-gray-700 font-sfmono bg-black text-white text-xs sm:text-sm w-full"
            />
          </div>
          <p className="text-sm flex flex-row">
            <img
              src={`${BASE_URL}/assets/baryon.png`}
              alt="baryon-logo"
              className="w-5 h-5 inline-block"
            />
            MAX:&nbsp;
            <span className="font-sfmono text-sm text-accent-primary">
              {Number(baryonBalance).toFixed(2)}
            </span>
          </p>
        </div>
      </div>

      <div className="border-[3px] border-black bg-dark-card rounded-full p-2 -my-[0.7rem] z-10">
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 2L6 14L2 10" stroke="rgb(107, 114, 128)" strokeWidth="2" strokeLinecap="square" strokeLinejoin="round"/>
          <path d="M10 14L10 2L14 6" stroke="rgb(107, 114, 128)" strokeWidth="2" strokeLinecap="square" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* Token Output Fields */}
      {userDistribution && (
        <div className="bg-dark-card p-4 rounded w-full">
          <div className="mb-4 flex flex-row items-center justify-between space-x-2 sm:space-x-10">
            <div className="flex flex-col items-start justify-between w-full">
              <div className="flex flex-row items-center gap-2 bg-black px-3 py-2 rounded w-full">
                <label
                  htmlFor="antiTokens"
                  className="text-accent-secondary font-medium text-xs sm:text-sm"
                >
                  $tPRO
                </label>
                <span className="border-l border-gray-400/50 h-[0.8rem]"></span>
                <input
                  id="proTokens"
                  type="number"
                  min="0"
                  disabled={true}
                  value={proTokens > 0 ? proTokens : "-"}
                  placeholder="-"
                  className="text-gray-700 font-sfmono bg-black text-white text-xs sm:text-sm w-full disabled:cursor-not-allowed"
                  readOnly
                />
              </div>
              <p className="text-sm font-sfmono">
                <img
                  src={`${BASE_URL}/assets/pro.png`}
                  alt="pro-logo"
                  className="w-3 h-3 mt-[-2px] mr-1 inline-block"
                />
                BAL:{" "}
                <span className="font-sfmono text-white text-sm">
                  {Number(proBalance).toFixed(0)}
                </span>
              </p>
            </div>

            <div className="flex flex-col items-end justify-between w-full">
              <div className="flex flex-row items-center gap-2 bg-black px-3 py-2 rounded w-full">
                <label
                  htmlFor="antiTokens"
                  className="text-accent-orange font-medium text-xs sm:text-sm"
                >
                  $tANTI
                </label>
                <span className="border-l border-gray-400/50 h-[0.8rem]"></span>
                <input
                  id="antiTokens"
                  type="number"
                  min="0"
                  value={antiTokens > 0 ? antiTokens : "-"}
                  placeholder="-"
                  disabled={true}
                  className="text-gray-700 font-sfmono bg-black text-white text-xs sm:text-sm w-full disabled:cursor-not-allowed"
                  readOnly
                />
              </div>
              <p className="text-sm font-sfmono">
                <img
                  src={`${BASE_URL}/assets/anti.png`}
                  alt="anti-logo"
                  className="w-3 h-3 mt-[-2px] mr-1 inline-block"
                />
                BAL:{" "}
                <span className="font-sfmono text-white text-sm">
                  {Number(antiBalance).toFixed(0)}
                </span>
              </p>
            </div>
          </div>
          {lineChartData && (
            <Line data={lineChartData} options={lineChartData.options} />
          )}
        </div>
      )}
      {/* Submit Button */}
      <button
        onClick={handleReclaim}
        disabled={disabled || loading}
        className={`w-full mt-4 py-3 rounded-full transition-all ${
          disabled || loading
            ? "bg-gray-500 text-gray-300 cursor-not-allowed"
            : "bg-accent-primary text-white hover:bg-accent-secondary hover:text-black"
        }`}
      >
        {loading ? "Reclaiming..." : "Reclaim"}
      </button>
      <ToastContainer />
    </div>
  );
};

export default InvertCollider;
