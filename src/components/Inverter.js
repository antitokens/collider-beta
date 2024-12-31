import { useState, useEffect } from "react";
import { recordClaim } from "../utils/api";
import { calculateInversion } from "../utils/inverterAlpha";
import { implementScattering } from "../utils/scatterAlpha";
import { ToastContainer } from "react-toastify";
import { Chart, registerables } from "chart.js";
import BinaryOrbit from "./BinaryOrbit";
import { Line } from "react-chartjs-2";
import "react-toastify/dist/ReactToastify.css";
import {
  toastContainerConfig,
  toast,
  emptyConfig2,
  emptyBags,
  formatCount,
  formatPrecise,
  convertToLocaleTime,
} from "../utils/utils";
Chart.register(...registerables);

const Inverter = ({
  wallet,
  antiBalance,
  proBalance,
  antiUsage,
  proUsage,
  baryonBalance,
  photonBalance,
  disabled,
  BASE_URL,
  onClaimSubmitted,
  clearFields,
  antiData,
  proData,
  config = emptyConfig2,
  isMobile = false,
  bags = emptyBags,
}) => {
  const [loading, setLoading] = useState(false);
  const [antiTokens, setAntiTokens] = useState(0);
  const [proTokens, setProTokens] = useState(0);
  const [baryonTokens, setBaryonTokens] = useState(0);
  const [photonTokens, setPhotonTokens] = useState(0);
  const [change, setChange] = useState([0, 0, 0]);
  const [updated, setUpdated] = useState([0, 0]);
  const [gain, setGain] = useState(0);
  const [dollarGain, setDollarGain] = useState(0);
  const [invest, setInvest] = useState(0);
  const [userDistribution, setUserDistribution] = useState(null);
  const [lineChartData, setLineChartData] = useState(null);

  // Clear input fields when `clearFields` changes
  useEffect(() => {
    // Calculate expected rewardCurrents
    let myBag = -1;
    if (wallet.publicKey) {
      const rewardCurrent =
        bags !== emptyBags
          ? implementScattering(
              bags.baryon,
              bags.photon,
              bags.baryonPool,
              bags.photonPool,
              bags.anti,
              bags.pro,
              bags.antiPool,
              bags.proPool,
              antiData && proData
                ? [Number(antiData.priceUsd), Number(proData.priceUsd)]
                : [0, 0],
              bags.wallets
            )
          : undefined;
      
      myBag = rewardCurrent
        ? rewardCurrent.change.wallets.indexOf(wallet.publicKey.toString())
        : -1;

      if (proData && antiData && myBag >= 0) {
        const originalPosition =
          proUsage * proData.priceUsd + antiUsage * antiData.priceUsd;
        setChange([
          rewardCurrent.change.photon[myBag],
          rewardCurrent.change.baryon[myBag],
          rewardCurrent.change.gain[myBag],
        ]);
        setUpdated([
          rewardCurrent.invert.photon[myBag],
          rewardCurrent.invert.baryon[myBag],
        ]);
        if (proData && antiData && myBag >= 0) {
          const originalPosition =
            proUsage * proData.priceUsd + antiUsage * antiData.priceUsd;
          setInvest(originalPosition);
          setDollarGain(rewardCurrent.change.gain[myBag]);
          setGain(
            (Math.abs(rewardCurrent.change.gain[myBag]) / originalPosition) *
              100
          );
        }
      }
    }
  }, [antiData, proData, bags]);

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
    // Set Graphs
    if (userDistribution) {
      // Trial
      const F_ = antiBalance > proBalance ? -1 : 1;
      const G_ = antiBalance > proBalance ? 1 : -1;
      setAntiTokens(F_ < G_ ? userDistribution.u : userDistribution.s);
      setProTokens(F_ < G_ ? userDistribution.s : userDistribution.u);
      setLineChartData({
        type: "line",
        labels: userDistribution.short.map((value) =>
          value ? formatPrecise(value.toFixed(6)) : ""
        ),
        datasets: [
          {
            label: "Inverter",
            data: userDistribution.curve.map((item) => item.value),
            borderColor: "#ffffff",
            backgroundColor: "#ffffff", // Match the legend marker color
            pointStyle: "line",
          },
        ],
        options: {
          responsive: true,
          maintainAspectRatio: false,
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
                color: "#999999",
              },
              ticks: {
                display: photonTokens > 0,
                font: {
                  family: "'SF Mono Round'",
                  size: 10,
                },
                color: "#ffffffa2",
              },
              grid: {
                color: "#d3d3d322",
              },
            },
            y: {
              title: {
                display: false,
                text: "Reclaim", // Label for the X-axis
                font: {
                  family: "'SF Mono Round'",
                  size: 12,
                  weight: "bold",
                },
                color: "#999999",
              },
              grid: { color: "#d3d3d322" },
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

      if (photonTokens < 0.5 && photonTokens !== 0) {
        toast.error("Photon value must be larger than 1/2, unless exactly 0!");
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
      const timestamp = new Date().toISOString();
      // Record the claim
      await recordClaim(wallet.publicKey.toString(), {
        antiTokens: antiUsage - antiTokens,
        proTokens: proUsage - proTokens,
        baryonTokens: baryonTokens,
        photonTokens: photonTokens,
        signature,
        timestamp,
      });
      // Create claim data object
      const claimData = {
        antiTokens: antiBalance - antiTokens,
        proTokens: proBalance - proTokens,
        baryonTokens: baryonTokens,
        photonTokens: photonTokens,
        signature,
        timestamp: timestamp,
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
      const distribution = calculateInversion(baryonTokens, photonTokens);
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
      <div className="flex flex-col items-center justify-between bg-dark-card w-full p-4 rounded gap-2">
        <div className="text-lg text-gray-300 mb-2">Reclaim</div>
        <div className="flex flex-row justify-between items-end text-sm text-gray-500 w-full">
          <div className="flex text-left text-xs">
            <div className="relative group">
              <div className="cursor-pointer">&#9432;&nbsp;</div>
              <span className="absolute text-sm p-2 bg-gray-800 rounded-md w-64 -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block">
                Displays your current tokens in the pool
              </span>
            </div>
            <div>&nbsp;Your Tokens:&nbsp;</div>
            <div className="flex flex-row justify-center font-sfmono mb-[2px]">
              <div className="text-accent-steel text-[11px] opacity-95">
                {formatPrecise(updated[0])}
              </div>
              <div>/</div>
              <div className="text-accent-cement text-[11px] opacity-95">
                {formatPrecise(updated[1])}
              </div>
            </div>
          </div>
          <div className="flex flex-row text-right text-[12px] -mt-[2px]">
            <div>
              Realised P/L:{" "}
              <span className="text-[11px] text-white font-sfmono">
                <span className="text-gray-400">$</span>
                {formatCount(dollarGain.toFixed(2))}
              </span>{" "}
            </div>
            &nbsp;
            <div className="flex flex-row text-right">
              <span className="text-[11px] text-gray-400 font-sfmono pt-[1px]">
                (
                <span className="text-accent-secondary opacity-95">
                  {formatCount(gain.toFixed(2))}%
                </span>
                )&nbsp;
              </span>
              <span className="relative group">
                <div className="cursor-pointer text-xs mt-[2px]">&#9432;</div>
                <span className="absolute text-sm p-2 bg-gray-800 rounded-md w-64 -translate-x-[224px] lg:-translate-x-[55px] -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block">
                  {`Displays your current realised profit or loss`}
                </span>
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-row justify-between items-end text-sm text-gray-500 w-full -mt-2">
          <div className="flex text-left text-md">
            <div>Claim Tokens from Pool</div>
          </div>
          <div className="flex flex-row text-right text-[12px]">
            <div>
              Token Change:{" "}
              <span className="text-[11px] text-white font-sfmono">
                <span
                  className={`font-sfmono text-accent-${
                    Number(change[0]) > 0 ? "secondary" : "primary"
                  }`}
                >
                  {Number(change[0]) > 0
                    ? "+" +
                      Number(change[0])
                        .toFixed(1)
                        .toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    : Number(change[0]) < 0
                    ? "-" +
                      Number(Math.abs(change[0]))
                        .toFixed(1)
                        .toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    : "-"}
                </span>
              </span>
              {"/"}
              <span
                className={`text-[11px] font-sfmono text-accent-${
                  Number(change[1]) > 0 ? "secondary" : "primary"
                }`}
              >
                {Number(change[1]) > 0
                  ? "+" +
                    Number(change[1])
                      .toFixed(1)
                      .toString()
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  : Number(change[1]) < 0
                  ? "-" +
                    Number(Math.abs(change[1]))
                      .toFixed(1)
                      .toString()
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  : "-"}
              </span>
              &nbsp;&nbsp;
            </div>
            <span className="relative group">
              <div className="cursor-pointer text-xs mt-[2px]">&#9432;</div>
              <span className="absolute text-sm p-2 bg-gray-800 rounded-md w-64 -translate-x-[224px] lg:-translate-x-[55px] -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block">
                {`Displays your current realised changes in PHOTON & BARYON`}
              </span>
            </span>
          </div>
        </div>
        <div className="flex flex-row items-center w-full">
          <div className="flex flex-col items-start w-full mr-2">
            <div className="flex flex-row items-center gap-2 bg-black px-3 py-2 rounded w-full">
              <label
                htmlFor="photonTokens"
                className="text-gray-300 font-medium text-xs sm:text-sm"
              >
                $PHOTON
              </label>
              <span className="border-l border-gray-400/50 h-[0.8rem]"></span>
              <input
                id="photonTokens"
                type="number"
                min="0.5"
                max={photonBalance}
                value={Math.abs(photonTokens) || ""}
                disabled={
                  config.startTime === "-"
                    ? true
                    : new Date() < new Date(config.startTime)
                    ? true
                    : false
                }
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
              BAL:&nbsp;
              <span className="font-sfmono text-gray-400">
                {Number(updated[0])
                  .toFixed(0)
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end w-full ml-2">
            <div className="flex flex-row items-center gap-2 bg-black px-3 py-2 rounded w-full">
              <input
                id="baryonTokens"
                type="number"
                min="0"
                max={baryonBalance}
                disabled={
                  config.startTime === "-"
                    ? true
                    : new Date() < new Date(config.startTime)
                    ? true
                    : false
                }
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
                $BARYON
              </label>
            </div>
            <div className="text-xs text-gray-500">
              <img
                src={`${BASE_URL}/assets/baryon.png`}
                alt="baryon-logo"
                className="w-3 h-3 mt-[-2px] mr-1 inline-block opacity-75"
              />
              BAL:&nbsp;
              <span className="font-sfmono text-gray-400">
                {Number(updated[1])
                  .toFixed(0)
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              </span>
            </div>
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
                  $PRO
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
                  $ANTI
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
          {lineChartData && baryonTokens > 0 && (
            <div style={{ height: "300px" }}>
              <Line data={lineChartData} options={lineChartData.options} />
            </div>
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
        disabled={
          disabled ||
          loading ||
          (baryonTokens === 0 && photonTokens === 0) ||
          new Date() < new Date(config.startTime) ||
          (photonTokens < 0.5 && photonTokens !== 0)
        }
        className={`w-full mt-4 py-3 rounded-full transition-all ${
          disabled || loading || new Date() < new Date(config.startTime)
            ? "bg-gray-500 text-gray-300 cursor-not-allowed"
            : "bg-accent-primary text-white hover:bg-accent-secondary hover:text-black"
        }`}
      >
        {new Date() < new Date(config.startTime)
          ? "Closed"
          : photonTokens < 0.5 && photonTokens !== 0
          ? "Reclaim"
          : loading
          ? "Reclaiming..."
          : "Reclaim"}
      </button>
      <ToastContainer {...toastContainerConfig} />
    </div>
  );
};

export default Inverter;
