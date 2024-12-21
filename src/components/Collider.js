import { useState, useEffect, useRef } from "react";
import { recordVote, hasVoted } from "../utils/api";
import { calculateDistribution, formatCount } from "../utils/colliderAlpha";
import BinaryOrbit from "../components/BinaryOrbit";
import { ToastContainer } from "react-toastify";
import { Chart, registerables } from "chart.js";
import { Pie, Bar, Line } from "react-chartjs-2";
import "react-toastify/dist/ReactToastify.css";
import { toastContainerConfig, toast } from "../utils/utils";
import { color } from "chart.js/helpers";
Chart.register(...registerables);

const Collider = ({
  wallet,
  antiBalance,
  proBalance,
  baryonBalance,
  photonBalance,
  disabled,
  BASE_URL,
  onVoteSubmitted,
  clearFields,
  antiData,
  proData,
}) => {
  const [loading, setLoading] = useState(false);
  const [betPool, setBetPool] = useState({
    open: "10.12.2024 16:00",
    close: "12.12.2024 21:00",
    antiLive: 21098367,
    proLive: 20384782,
  });
  const [antiTokens, setAntiTokens] = useState(0);
  const [proTokens, setProTokens] = useState(0);
  const [baryonTokens, setBaryonTokens] = useState(0);
  const [photonTokens, setPhotonTokens] = useState(0);
  const [userDistribution, setUserDistribution] = useState(null);
  const [lineChartData, setLineChartData] = useState(null);
  const [totalInvest, setTotalInvest] = useState(0);
  const [dollarBet, setDollarbet] = useState(0);
  const [splitPercentage, setSplitPercentage] = useState(50);
  const sliderRef = useRef(null);
  // Clear input fields when `clearFields` changes
  useEffect(() => {
    if (clearFields) {
      setAntiTokens(0);
      setProTokens(0);
      setBaryonTokens(0);
      setPhotonTokens(0);
      setTotalInvest(0);
      setDollarbet(0);
      setSplitPercentage(50);
      handleSliderInput(50);
    }
  }, [clearFields]);

  // Prepare line chart data
  useEffect(() => {
    if (userDistribution) {
      // Trial
      const F = (antiTokens + proTokens) / 2;
      const G = (antiTokens + proTokens) / 2;

      setBaryonTokens(F * (1 * userDistribution.u));
      setPhotonTokens(G * (1 / userDistribution.s));
      setLineChartData({
        type: "line",
        labels: userDistribution.range.map((value) =>
          value ? value.toFixed(2) : ""
        ),
        datasets: [
          {
            label: "Collider",
            data: userDistribution.distribution.map((item) => item.value),
            borderColor: "#ffffff",
            backgroundColor: "#ffffff", // Match the legend marker color
            pointStyle: "line",
          },
          {
            label: "Emitter",
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
                text: "Your Normalised Vote", // Label for the X-axis
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
                color: antiTokens !== proTokens ? "#ffffffa2" : "#d3d3d300",
              },
              grid: {
                color: antiTokens !== proTokens ? "#ffffffa2" : "#d3d3d300",
              },
            },
            x2: {
              position: "top",
              title: {
                display: false,
                text: "Your Normalised Vote", // Label for the X-axis
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
                  return antiTokens !== proTokens
                    ? range2[index].toFixed(2)
                    : "";
                },
                font: {
                  family: "'SF Mono Round'",
                  size: 10,
                },
                color: "#ff5f3b",
              },
              grid: {
                color: antiTokens !== proTokens ? "#d3d3d322" : "#d3d3d300",
              },
            },
            y: {
              title: {
                display: true,
                text: "Emissions", // Label for the X-axis
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
                text: "Emissions", // Label for the X-axis
                font: {
                  family: "'SF Mono Round'",
                  size: 12,
                  weight: "bold",
                },
                color: "#808080",
              },
              grid: { color: "#d3d3d300" },
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
        toast.error("You must predict with at least some tokens!");
        return;
      }

      if (antiTokens > antiBalance || proTokens > proBalance) {
        toast.error("You cannot predict with more tokens than you have!");
        return;
      }

      // Check if the user has already predictiond
      /*
      if (await hasVoted(wallet.publicKey.toString())) {
        toast.error("You have already predicted!");
        return;
      }
      */

      // Prompt for Solana signature
      const message = `Requesting signature to predict with:
        ${antiTokens.toFixed(2)} $ANTI,
        ${proTokens.toFixed(2)} $PRO,
        for
        ${baryonTokens.toFixed(2)} $BARYON,
        ${photonTokens.toFixed(2)} $PHOTON
        with account ${wallet.publicKey.toString()}`;
      const signatureUint8Array = await wallet.signMessage(
        new TextEncoder().encode(message)
      );
      const signature = btoa(String.fromCharCode(...signatureUint8Array));

      // Record the prediction
      await recordVote(wallet.publicKey.toString(), {
        antiTokens,
        proTokens,
        baryonTokens,
        photonTokens,
        signature,
      });
      // Create prediction data object
      const predictionData = {
        antiTokens,
        proTokens,
        baryonTokens,
        photonTokens,
        signature,
        timestamp: new Date().toISOString(),
        wallet: wallet.publicKey.toString(),
      };
      onVoteSubmitted(true, predictionData);
      toast.success("Your prediction has been recorded!");
    } catch (error) {
      console.error("VOTE_SUBMISSION_FAILED:", error);
      toast.error("An error occurred while recording your prediction");
      onVoteSubmitted(false, { error: error.message });
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
        short: [0, 1],
        curve: [
          { x: 0, value: 0 },
          { x: 1, value: 0 },
        ],
      });
    }
  }, [antiTokens, proTokens]);

  const updateSplit = (total, percentage) => {
    const pro = (percentage / 100) * total;
    const anti = total - pro;
    if (!proData || !antiData) {
      return;
    }
    setDollarbet(pro * proData.priceUsd + anti * antiData.priceUsd);
    setProTokens(pro);
    setAntiTokens(anti);
  };

  const handleTotalInvestChange = (e) => {
    const total = Math.abs(Number(e.target.value));
    setTotalInvest(total);
    updateSplit(total, splitPercentage);
  };

  const handlePercentageChange = (e) => {
    const percentage = e.target.value;
    setSplitPercentage(percentage);
    updateSplit(totalInvest, percentage);
    handleSliderInput(percentage);
  };

  const handleProTokensChange = (e) => {
    const pro = Math.abs(Number(e.target.value));
    const newTotal = pro + antiTokens;
    updateForm(newTotal, pro, antiTokens);
  };

  const handleAntiTokensChange = (e) => {
    const anti = Math.abs(Number(e.target.value));
    const newTotal = proTokens + anti;
    updateForm(newTotal, proTokens, anti);
  };

  const updateForm = (total, pro, anti) => {
    setTotalInvest(total);
    setProTokens(pro);
    setAntiTokens(anti);

    let percentage = 50;
    if (total != 0) {
      percentage = (pro / total) * 100;
    }
    setSplitPercentage(percentage);
    handleSliderInput(percentage);
  };

  const handleSliderInput = (value) => {
    sliderRef.current.style.background = `linear-gradient(to right, var(--accent-secondary) ${value}%, var(--accent-primary) ${value}%)`;
  };

  useEffect(() => {
    if (sliderRef.current) {
      let percentage = 50;

      if (totalInvest > 0) {
        percentage = (proTokens / totalInvest) * 100;
      }

      handleSliderInput(percentage);
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full bg-black border-x border-b border-gray-800 rounded-b-lg p-5 relative">
      <div className="bg-dark-card p-4 rounded w-full mb-4">
        <h2 className="text-2xl text-gray-200 text-center font-medium mb-2">
          Will BTC hit $1m in 2025?
        </h2>
        <div className="flex flex-row justify-between">
          <div className="text-[12px] text-gray-500 text-left">
            <span className="relative group">
              <span className="cursor-pointer">
                &#9432;
                <span className="absolute text-sm p-2 bg-gray-800 rounded-md w-64 translate-x-0 lg:translate-x-0 -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block">
                  Poll opening date & time
                </span>
              </span>
            </span>{" "}
            &nbsp;Open:{" "}
            <span className="font-sfmono text-gray-400 text-[11px]">
              {betPool.open}
            </span>{" "}
          </div>
          <div className="text-[12px] text-gray-500 text-right">
            Close:{" "}
            <span className="font-sfmono text-gray-400 text-[11px]">
              {betPool.close}
            </span>{" "}
            &nbsp;
            <span className="relative group">
              <span className="cursor-pointer">
                &#9432;
                <span className="absolute text-sm p-2 bg-gray-800 rounded-md w-64 -translate-x-1/4 lg:translate-x-1/4 -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block">
                  Poll closing date & time
                </span>
              </span>
            </span>
          </div>
        </div>
        <div className="flex flex-row justify-between">
          <div className="text-[12px] text-gray-500 text-left">
            <span className="relative group">
              <span className="cursor-pointer">&#9432;</span>
              <span className="absolute text-sm p-2 bg-gray-800 rounded-md w-64 translate-x-0 lg:translate-x-0 -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block">
                Total amount of PRO & ANTI in the prediction pool
              </span>
            </span>{" "}
            &nbsp;Total Pool:{" "}
            <span className="font-sfmono text-accent-secondary text-[12px] text-opacity-80">
              {formatCount(betPool.proLive)}
            </span>
            {"/"}
            <span className="font-sfmono text-accent-primary text-[12px] text-opacity-90">
              {formatCount(betPool.antiLive)}
            </span>
          </div>
          <div className="text-[12px] text-gray-500 text-right">
            Pool Ratio:{" "}
            <span className="font-sfmono text-gray-400 text-[11px]">
              {(betPool.proLive / betPool.antiLive).toFixed(3)}
            </span>{" "}
            &nbsp;
            <span className="relative group">
              <span className="cursor-pointer">
                &#9432;
                <span className="absolute text-sm p-2 bg-gray-800 rounded-md w-64 -translate-x-1/2 lg:translate-x-0 -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block">
                  Ratio PRO:ANTI in the prediction pool
                </span>
              </span>
            </span>
          </div>
        </div>
      </div>
      {/* Token Input Fields */}
      <div className="flex flex-col items-center bg-dark-card p-4 rounded w-full">
        <div className="text-lg text-gray-300">Predict</div>
        <div className="w-full space-y-2 mt-4">
          <div className="flex flex-row justify-between text-sm text-gray-500">
            <div>Total Tokens in Stake &nbsp;</div>
            <div>
              USD Value:{" "}
              <span className="text-[12px] text-white font-sfmono">
                <span className="text-gray-400">$</span>
                {dollarBet.toFixed(2)}
              </span>
            </div>
          </div>
          <input
            id="totalInvest"
            type="number"
            onFocus={(e) => e.target.select()}
            value={Math.abs(totalInvest) || ""}
            onChange={handleTotalInvestChange}
            onWheel={(e) => e.target.blur()}
            placeholder="0"
            className="w-full text-center text-sm text-white font-sfmono bg-black rounded px-2 py-2"
          />
          <input
            className="w-full"
            ref={sliderRef}
            onInput={handleSliderInput}
            onWheel={(e) => e.target.blur()}
            type="range"
            min="0"
            max="100"
            value={splitPercentage}
            onChange={handlePercentageChange}
          />
          <div className="flex flex-row items-center justify-between text-[14px]">
            <span className="text-accent-secondary font-sfmono">
              {Number(splitPercentage).toFixed(0)}%
            </span>
            <span className="text-accent-primary font-sfmono">
              {Number(100 - splitPercentage).toFixed(0)}%
            </span>
          </div>
        </div>
        <div className="w-full flex gap-1/2 sm:gap-4 mt-4 justify-between">
          <div className="flex flex-col items-start gap-0 w-full">
            <div className="flex items-center bg-black px-3 py-2 rounded gap-2 w-full">
              <label
                htmlFor="proTokens"
                className="text-accent-secondary font-medium text-sm"
              >
                $tPRO
              </label>
              <span className="border-l border-gray-400/50 h-[0.8rem]"></span>
              <input
                id="proTokens"
                type="number"
                min="0"
                max={proBalance}
                value={Math.abs(proTokens) || ""}
                onChange={handleProTokensChange}
                onFocus={(e) => e.target.select()}
                onMouseDown={(e) => setProTokens(0)}
                placeholder="0"
                className="w-full font-sfmono bg-black text-white text-sm"
              />
            </div>
            <div className="text-xs">
              <img
                src={`${BASE_URL}/assets/pro.png`}
                alt="pro-logo"
                className="w-3 h-3 mr-1 mt-[-2.5px] inline-block opacity-75"
              />
              <span className="text-gray-500">MAX:</span>&nbsp;
              <span className="font-sfmono text-accent-secondary text-opacity-75">
                {Number(proBalance)
                  .toFixed(0)
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1/2 w-full">
            <div className="flex items-center bg-black px-3 py-2 rounded gap-2 w-full">
              <input
                id="antiTokens"
                type="number"
                min="0"
                max={antiBalance}
                value={Math.abs(antiTokens) || ""}
                onChange={handleAntiTokensChange}
                onFocus={(e) => e.target.select()}
                onMouseDown={(e) => setAntiTokens(0)}
                placeholder="0"
                className="w-full font-sfmono bg-black text-white text-xs sm:text-sm text-right"
              />
              <span className="border-l border-gray-400/50 h-[0.8rem]"></span>
              <label
                htmlFor="antiTokens"
                className="text-accent-orange font-medium text-sm"
              >
                $tANTI
              </label>
            </div>
            <div className="text-xs">
              <img
                src={`${BASE_URL}/assets/anti.png`}
                alt="anti-logo"
                className="w-3 h-3 mr-1 mt-[-2.5px] inline-block opacity-75"
              />
              <span className="text-gray-500">MAX:</span>&nbsp;
              <span className="font-sfmono text-accent-primary text-opacity-90">
                {Number(antiBalance)
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
          invert={false}
        />
      </div>

      {/* User Distribution */}
      {userDistribution && (
        <div className="bg-dark-card p-4 rounded w-full">
          <div className="mb-4 flex flex-row items-center justify-between space-x-2 sm:space-x-10">
            <div className="flex flex-col items-start gap-1/2 w-full">
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
                  value={
                    Number(photonTokens) > 0
                      ? Number(photonTokens).toFixed(2)
                      : ""
                  }
                  disabled={true}
                  placeholder="-"
                  className="text-white font-sfmono bg-black text-white text-xs sm:text-sm w-full disabled:cursor-not-allowed"
                  readOnly
                />
              </div>
              <div className="text-sm flex flex-row items-center">
                <img
                  src={`${BASE_URL}/assets/photon.png`}
                  alt="photon-logo"
                  className="w-3 h-3 inline-block mr-1 opacity-75"
                />
                <span className="text-xs">
                  <span className="text-gray-500 text-semibold">BAL:</span>{" "}
                  <span className="font-sfmono text-gray-400">
                    {Number(photonBalance)
                      .toFixed(0)
                      .toString()
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </span>
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1/2 items-end w-full">
              <div className="flex flex-row items-center gap-2 bg-black px-3 py-2 rounded w-full">
                <input
                  id="baryonTokens"
                  type="number"
                  min="0"
                  value={
                    Number(baryonTokens) > 0
                      ? Number(baryonTokens).toFixed(2)
                      : ""
                  }
                  disabled={true}
                  placeholder="-"
                  className="w-full text-white font-sfmono bg-black text-white text-xs sm:text-sm disabled:cursor-not-allowed text-right"
                  readOnly
                />
                <span className="border-l border-gray-400/50 h-[0.8rem]"></span>
                <label
                  htmlFor="baryonTokens"
                  className="text-gray-300 font-medium text-xs sm:text-sm"
                >
                  $tBARYON
                </label>
              </div>
              <div className="text-sm flex flex-row items-center">
                <img
                  src={`${BASE_URL}/assets/baryon.png`}
                  alt="baryon-logo"
                  className="w-3 h-3 inline-block mr-1 opacity-75"
                />
                <span className="text-xs">
                  <span className="text-gray-500 text-semibold">BAL:</span>{" "}
                  <span className="font-sfmono text-gray-400">
                    {Number(baryonBalance)
                      .toFixed(0)
                      .toString()
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </span>
                </span>
              </div>
            </div>
          </div>
          {lineChartData && (
            <Line data={lineChartData} options={lineChartData.options} />
          )}
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleVote}
        disabled={disabled || loading}
        className={`w-full mt-4 py-3 rounded-full transition-all ${
          disabled || loading
            ? "bg-gray-500 text-gray-300 cursor-not-allowed"
            : "bg-accent-primary text-white hover:bg-accent-secondary hover:text-black"
        }`}
      >
        {loading ? "Submitting..." : "Submit"}
      </button>
      <ToastContainer {...toastContainerConfig} />
      <p
        className={`mt-0 text-sm ${
          wallet.connected ? "text-gray-300" : "text-red-500 animate-pulse"
        }`}
      >
        {wallet.connected ? "" : "Connect your wallet to enable voting"}
      </p>
    </div>
  );
};

export default Collider;
