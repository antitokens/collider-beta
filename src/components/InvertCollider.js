import { useState, useEffect } from "react";
import { recordClaim } from "../utils/api";
import { calculateDistribution } from "../utils/colliderAlpha";
import { ToastContainer } from "react-toastify";
import { Chart, registerables } from "chart.js";
import BinaryOrbit from "../components/BinaryOrbit";
import { Line } from "react-chartjs-2";
import "react-toastify/dist/ReactToastify.css";
import { toastContainerConfig, toast } from "../utils/utils";
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
  antiData,
  proData,
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
        labels: userDistribution.range.map((value) =>
          value ? value.toFixed(2) : ""
        ),
        datasets: [
          {
            label: "Inverter",
            data: userDistribution.distribution.map((item) => item.value),
            borderColor: "#ffffff",
            backgroundColor: "#ffffff", // Match the legend marker color
            pointStyle: "line",
          },
          {
            label: "Reclaimer",
            data: userDistribution.curve.map((item) => item.value),
            borderColor: "#ff5f3b",
            backgroundColor: "#ff5f3b", // Match the legend marker color
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
                color: "#ffffffa2",
                pointStyle: "circle",
                usePointStyle: true,
                boxWidth: 7,
                boxHeight: 7,
              },
              display: true,
              position: "top",
              align: "center",
            },
            datalabels: {
              display: false,
            },
            tooltip: {
              enabled: false,
            },
          },
          layout: {
            padding: {
              top: 15, // Add padding to avoid overlapping
              left: 5,
              right: 5,
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
                  size: 12,
                  weight: "bold",
                },
                color: "#808080",
              },
              ticks: {
                font: {
                  family: "'SF Mono Round'",
                  size: 10,
                },
                color:
                  baryonTokens !== photonTokens ? "#ffffffa2" : "#ffffff00",
              },
              grid: {
                color:
                  baryonTokens !== photonTokens ? "#d3d3d322" : "#d3d3d300",
              },
            },
            x2: {
              position: "top",
              title: {
                display: false,
                text: "Probability Range", // Label for the X-axis
                font: {
                  family: "'SF Mono Round'",
                  size: 12,
                  weight: "bold",
                },
                color: "#808080",
              },
              ticks: {
                callback: function (value, index) {
                  // Map index to a new labels array for the second axis
                  const range2 = userDistribution.short;
                  return baryonTokens !== photonTokens
                    ? range2[index].toFixed(2)
                    : "";
                },
                font: {
                  family: "'SF Mono Round'",
                  size: 10,
                },
                color: baryonTokens !== photonTokens ? "#ff5f3b" : "#ff5f3b00",
              },
              grid: {
                color:
                  baryonTokens !== photonTokens ? "#d3d3d322" : "#d3d3d300",
              },
            },
            y: {
              title: {
                display: true,
                text: "Reclaim", // Label for the X-axis
                font: {
                  family: "'SF Mono Round'",
                  size: 12,
                  weight: "bold",
                },
                color: "#808080",
              },
              grid: { color: "#d3d3d322" },
              ticks: {
                callback: function (value) {
                  return ""; // Format y-axis
                },
              },
            },
            y2: {
              position: "right",
              title: {
                display: true,
                text: "Reclaim", // Label for the X-axis
                font: {
                  family: "'SF Mono Round'",
                  size: 12,
                  weight: "bold",
                },
                color: "#808080",
              },
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
        toast.error("You must claim with at least some tokens!");
        return;
      }

      if (baryonTokens > baryonBalance || photonTokens > photonBalance) {
        toast.error("You cannot claim with more tokens than you have!");
        return;
      }

      // Prompt for Solana signature
      const message = `Requesting signature to claim with:
        ${baryonTokens.toFixed(2)} $BARYON,
        ${photonTokens.toFixed(2)} $PHOTON,
        for
        ${baryonTokens.toFixed(2)} $ANTI,
        ${photonTokens.toFixed(2)} $PRO
        with account ${wallet.publicKey.toString()}`;
      const signatureUint8Array = await wallet.signMessage(
        new TextEncoder().encode(message)
      );
      const signature = btoa(String.fromCharCode(...signatureUint8Array));

      // Record the claim
      await recordClaim(wallet.publicKey.toString(), {
        antiTokens,
        proTokens,
        baryonTokens,
        photonTokens,
        signature,
      });
      // Create claim data object
      const claimData = {
        antiTokens,
        proTokens,
        baryonTokens,
        photonTokens,
        signature,
        timestamp: new Date().toISOString(),
        wallet: wallet.publicKey.toString(),
      };
      // Emit the updated data
      onClaimSubmitted(true, claimData);
      toast.success("Your claim has been recorded!");
    } catch (error) {
      console.error("CLAIM_SUBMISSION_FAILED:", error);
      toast.error("An error occurred while recording your claim");
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
              className="text-gray-300 font-medium text-xs sm:text-sm"
            >
              $tPHOTON
            </label>
            <span className="border-l border-gray-400/50 h-[0.8rem]"></span>
            <input
              id="photonTokens"
              type="number"
              min="0"
              max={photonBalance}
              value={Math.abs(photonTokens) || ""}
              onChange={(e) =>
                setPhotonTokens(Math.abs(Number(e.target.value)))
              }
              onFocus={(e) => e.target.select()}
              placeholder="0"
              className="font-sfmono bg-black text-white text-xs sm:text-sm w-full"
            />
          </div>
          <div className="text-xs text-gray-500">
            <img
              src={`${BASE_URL}/assets/photon.png`}
              alt="photon-logo"
              className="w-3 h-3 mt-[-2px] mr-1 inline-block opacity-75"
            />
            MAX:&nbsp;
            <span className="font-sfmono text-gray-400">
              {Number(photonBalance)
                .toFixed(0)
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end w-full">
          <div className="flex flex-row items-center gap-2 bg-black px-3 py-2 rounded w-full">
            <input
              id="baryonTokens"
              type="number"
              min="0"
              max={baryonBalance}
              value={Math.abs(baryonTokens) || ""}
              onChange={(e) =>
                setBaryonTokens(Math.abs(Number(e.target.value)))
              }
              onFocus={(e) => e.target.select()}
              placeholder="0"
              className="w-full font-sfmono bg-black text-white text-xs sm:text-sm w-full text-right"
            />
            <span className="border-l border-gray-400/50 h-[0.8rem]"></span>
            <label
              htmlFor="baryonTokens"
              className="text-gray-300 font-medium text-xs sm:text-sm"
            >
              $tBARYON
            </label>
          </div>
          <div className="text-xs text-gray-500">
            <img
              src={`${BASE_URL}/assets/baryon.png`}
              alt="baryon-logo"
              className="w-3 h-3 mt-[-2px] mr-1 inline-block opacity-75"
            />
            MAX:&nbsp;
            <span className="font-sfmono text-gray-400">
              {Number(baryonBalance)
                .toFixed(0)
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            </span>
          </div>
        </div>
      </div>

      <div className="border-[3px] border-black bg-dark-card rounded-full p-2 -my-[0.7rem] z-10">
        <BinaryOrbit
          size={28}
          orbitRadius={10}
          particleRadius={3}
          padding={0}
          invert={true}
        />
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
                  value={
                    Number(proTokens) > 0 ? Number(proTokens).toFixed(2) : ""
                  }
                  placeholder="-"
                  className="font-sfmono bg-black text-white text-xs sm:text-sm w-full disabled:cursor-not-allowed"
                  readOnly
                />
              </div>
              <div className="text-xs text-gray-500">
                <img
                  src={`${BASE_URL}/assets/pro.png`}
                  alt="pro-logo"
                  className="w-3 h-3 mt-[-2px] mr-1 inline-block opacity-75"
                />
                BAL:{" "}
                <span className="font-sfmono text-accent-secondary text-opacity-75">
                  {Number(proBalance)
                    .toFixed(0)
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end justify-between w-full">
              <div className="flex flex-row items-center gap-2 bg-black px-3 py-2 rounded w-full">
                <input
                  id="antiTokens"
                  type="number"
                  min="0"
                  value={
                    Number(antiTokens) > 0 ? Number(antiTokens).toFixed(2) : ""
                  }
                  placeholder="-"
                  disabled={true}
                  className="font-sfmono bg-black text-white text-xs sm:text-sm w-full disabled:cursor-not-allowed text-right"
                  readOnly
                />
                <span className="border-l border-gray-400/50 h-[0.8rem]"></span>
                <label
                  htmlFor="antiTokens"
                  className="text-accent-orange font-medium text-xs sm:text-sm"
                >
                  $tANTI
                </label>
              </div>
              <div className="text-xs text-gray-500">
                <img
                  src={`${BASE_URL}/assets/anti.png`}
                  alt="anti-logo"
                  className="w-3 h-3 mt-[-2px] mr-1 inline-block opacity-75"
                />
                BAL:{" "}
                <span className="font-sfmono text-accent-primary text-opacity-90">
                  {Number(antiBalance)
                    .toFixed(0)
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </span>
              </div>
            </div>
          </div>
          {lineChartData && (
            <Line data={lineChartData} options={lineChartData.options} />
          )}
        </div>
      )}
      <div className="flex flex-row justify-between text-sm text-gray-500 w-full mt-4">
        <div>
          Total Tokens in Reclaim:{" "}
          <span className="text-[12px] text-white font-sfmono">
            {Number(antiTokens) + Number(proTokens)
              ? (Number(antiTokens) + Number(proTokens)).toFixed(2)
              : "0"}
          </span>
        </div>
        <div>
          USD Value:{" "}
          <span className="text-[12px] text-white font-sfmono">
            <span className="text-gray-400">$</span>
            {Number(antiTokens) + Number(proTokens)
              ? (
                  antiData.priceUsd * Number(antiTokens) +
                  proData.priceUsd * Number(proTokens)
                ).toFixed(2)
              : "0.00"}
          </span>
        </div>
      </div>
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
      <ToastContainer {...toastContainerConfig} />
    </div>
  );
};

export default InvertCollider;
