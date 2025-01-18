import { useState, useEffect, useRef } from "react";
import { recordPrediction } from "../utils/api";
import { calculateCollision } from "../utils/colliderAlpha";
import { calculateEqualisation } from "../utils/equaliserAlpha";
import BinaryOrbit from "../components/BinaryOrbit";
import { ToastContainer } from "react-toastify";
import { Chart, registerables } from "chart.js";
import { Line } from "react-chartjs-2";
import "react-toastify/dist/ReactToastify.css";
import {
  toastContainerConfig,
  toast,
  emptyBags,
  emptyMetadata,
  formatCount,
  formatPrecise,
  defaultToken,
  copyText,
} from "../utils/utils";
Chart.register(...registerables);

/* Collider Container */
const Collider = ({
  wallet,
  antiBalance,
  proBalance,
  antiUsage,
  proUsage,
  baryonBalance,
  photonBalance,
  disabled,
  BASE_URL,
  onPredictionSubmitted,
  clearFields,
  antiData = defaultToken,
  proData = defaultToken,
  isMobile = false,
  bags = emptyBags,
  inactive = true,
  isMetaLoading = true,
}) => {
  const [loading, setLoading] = useState(isMetaLoading);
  const [antiTokens, setAntiTokens] = useState(0);
  const [proTokens, setProTokens] = useState(0);
  const [baryonTokens, setBaryonTokens] = useState(0);
  const [photonTokens, setPhotonTokens] = useState(0);
  const [userDistribution, setUserDistribution] = useState(null);
  const [pastDistribution, setPastDistribution] = useState(null);
  const [totalDistribution, setTotalDistribution] = useState(null);
  const [lineChartData, setLineChartData] = useState(null);
  const [totalInvest, setTotalInvest] = useState(0);
  const [dollarBet, setDollarBet] = useState(0);
  const [dollarStake, setDollarStake] = useState(0);
  const [gain, setGain] = useState(0);
  const [newGain, setNewGain] = useState(0);
  const [splitPercentage, setSplitPercentage] = useState(50);
  const sliderRef = useRef(null);

  useEffect(() => {
    setLoading(isMetaLoading);
  }, [isMetaLoading]);

  useEffect(() => {
    if (sliderRef.current) {
      let percentage = 50;
      if (totalInvest > 0) {
        percentage = (proTokens / totalInvest) * 100;
      }
      handleSliderInput(percentage);
    }
  }, []);

  useEffect(() => {
    if (antiData && proData) {
      setDollarStake(
        proUsage * proData.priceUsd + antiUsage * antiData.priceUsd
      );
    }
  }, [proUsage, antiUsage, antiData, proData]);

  // Clear input fields when `clearFields` changes
  useEffect(() => {
    if (clearFields) {
      setAntiTokens(0);
      setProTokens(0);
      setBaryonTokens(0);
      setPhotonTokens(0);
      setTotalInvest(0);
      setDollarBet(0);
      setSplitPercentage(50);
      handleSliderInput(50);
    }
  }, [clearFields]);

  // Prepare line chart data
  useEffect(() => {
    // Calculate expected rewardCurrents
    let myBag = -1;
    if (wallet.publicKey) {
      const rewardCurrent =
        bags !== emptyBags
          ? calculateEqualisation(
              bags.baryon,
              bags.photon,
              bags.anti,
              bags.pro,
              bags.antiPool,
              bags.proPool,
              antiData && proData
                ? [Number(antiData.priceUsd), Number(proData.priceUsd)]
                : [1, 1],
              bags.wallets,
              [antiUsage > proUsage ? 1 : 0, antiUsage < proUsage ? 1 : 0]
            )
          : undefined;
      myBag = rewardCurrent
        ? rewardCurrent.change.wallets.indexOf(wallet.publicKey.toString())
        : -1;
      if (proData && antiData && myBag >= 0) {
        const originalPosition =
          proUsage * proData.priceUsd + antiUsage * antiData.priceUsd;
        if (!wallet.disconnecting) {
          setGain(
            originalPosition !== 0 && (baryonBalance > 0 || photonBalance > 0)
              ? (rewardCurrent.change.gain[myBag] / originalPosition) * 100
              : 0
          );
        } else {
          setGain(0);
        }
      } else if (proData && antiData && myBag < 0 && totalInvest > 0) {
        let myFutureBag = -1;
        let pseudoBags = {
          baryon: [...bags.baryon],
          photon: [...bags.photon],
          baryonPool: bags.baryonPool + baryonTokens,
          photonPool: bags.photonPool + photonTokens,
          anti: [...bags.anti],
          pro: [...bags.pro],
          antiPool: bags.antiPool + antiTokens,
          proPool: bags.proPool + proTokens,
          wallets: [...bags.wallets],
        };
        pseudoBags.anti.push(antiTokens);
        pseudoBags.pro.push(proTokens);
        pseudoBags.baryon.push(baryonTokens);
        pseudoBags.photon.push(photonTokens);
        pseudoBags.wallets.push(wallet.publicKey.toString());

        const rewardFuture =
          pseudoBags !== emptyBags
            ? calculateEqualisation(
                pseudoBags.baryon,
                pseudoBags.photon,
                pseudoBags.anti,
                pseudoBags.pro,
                pseudoBags.antiPool,
                pseudoBags.proPool,
                antiData && proData
                  ? [Number(antiData.priceUsd), Number(proData.priceUsd)]
                  : [1, 1],
                pseudoBags.wallets,
                [antiTokens > proTokens ? 1 : 0, antiTokens < proTokens ? 1 : 0]
              )
            : undefined;
        myFutureBag = rewardFuture
          ? rewardFuture.change.wallets.indexOf(wallet.publicKey.toString())
          : -1;
        const originalPosition =
          proTokens * proData.priceUsd + antiTokens * antiData.priceUsd;

        if (!wallet.disconnecting) {
          setNewGain(
            originalPosition !== 0 && (baryonTokens > 0 || photonTokens > 0)
              ? (rewardFuture.change.gain[myFutureBag] / originalPosition) * 100
              : 0
          );
        } else {
          setNewGain(0);
        }
      }
    }

    if (userDistribution && totalDistribution && dollarStake) {
      // Trial
      const F = 1;
      const G = 1;
      setBaryonTokens(totalInvest > 0 ? F * totalDistribution.u : 0);
      setPhotonTokens(totalInvest > 0 ? G * totalDistribution.s : 0);

      // Create new arrays with updated values
      const updatedBaryonBags = [...bags.baryon];
      const updatedPhotonBags = [...bags.photon];
      const updatedAntiBags = [...bags.anti];
      const updatedProBags = [...bags.pro];

      if (myBag >= 0) {
        updatedBaryonBags[myBag] =
          totalInvest > 0 ? F * totalDistribution.u : baryonTokens;
        updatedPhotonBags[myBag] =
          totalInvest > 0 ? F * totalDistribution.u : photonTokens;
        updatedAntiBags[myBag] += antiTokens;
        updatedProBags[myBag] += proTokens;
      }

      const rewardUpdated =
        bags !== emptyBags
          ? calculateEqualisation(
              updatedBaryonBags,
              updatedPhotonBags,
              updatedAntiBags,
              updatedProBags,
              bags.antiPool + antiTokens,
              bags.proPool + proTokens,
              antiData && proData
                ? [Number(antiData.priceUsd), Number(proData.priceUsd)]
                : [1, 1],
              bags.wallets,
              [
                antiUsage + antiTokens > proUsage + proTokens ? 1 : 0,
                antiUsage + antiTokens < proUsage + proTokens ? 1 : 0,
              ]
            )
          : undefined;

      if (myBag >= 0) {
        setNewGain(
          dollarStake !== 0 &&
            !inactive &&
            !wallet.disconnecting &&
            totalInvest > 0
            ? (rewardUpdated.change.gain[myBag] / dollarStake) * 100
            : 0
        );
      }

      setLineChartData({
        type: "line",
        labels: userDistribution.short.map((value) =>
          value > 0 ? formatPrecise(value) : ""
        ),
        datasets: [
          {
            label: "Current",
            data:
              totalInvest <= 0
                ? []
                : userDistribution.curve.map((item) => item.value),
            borderColor: "#ffffff",
            backgroundColor: "#ffffff",
            pointStyle: "line",
            hidden: totalInvest <= 0,
          },
          {
            label: "Past",
            data:
              totalInvest <= 0
                ? []
                : pastDistribution
                ? pastDistribution.curve.map((item) => item.value)
                : [],
            borderColor: "#44c1cf",
            backgroundColor: "#44c1cf",
            pointStyle: "line",
            hidden: totalInvest <= 0,
          },
          {
            label: "Net",
            data:
              totalInvest <= 0
                ? []
                : totalDistribution
                ? totalDistribution.curve.map((item) => item.value)
                : [],
            borderColor: "#fcba03",
            backgroundColor: "#fcba03",
            pointStyle: "line",
            hidden: totalInvest <= 0,
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
              top: 0, // Add padding to avoid overlapping
              left: 5,
              right: 5,
              bottom: 0,
            },
          },
          scales: {
            x: {
              display: false,
              position: "bottom",
              title: {
                display: false,
                text: "Your Prediction", // Label for the X-axis
                font: {
                  family: "'SF Mono Round'",
                  size: 12,
                  weight: "bold",
                },
                color: "#999999",
              },
              ticks: {
                display: false,
                callback: function (value, index) {
                  // Map index to a new labels array for the second axis
                  return userDistribution
                    ? userDistribution.short[index]
                      ? formatCount(userDistribution.short[index], false)
                      : undefined
                    : undefined;
                },
                font: {
                  family: "'SF Mono Round'",
                  size: 10,
                },
                color: "#ffffffa2",
              },
              grid: {
                display: false,
                color: "#d3d3d322",
              },
            },
            x2: {
              display: false,
              position: "top",
              ticks: {
                display: false,
                callback: function (value, index) {
                  // Map index to a new labels array for the second axis
                  return userDistribution
                    ? totalDistribution.short[index]
                      ? formatCount(totalDistribution.short[index], false)
                      : undefined
                    : undefined;
                },
                font: {
                  family: "'SF Mono Round'",
                  size: 10,
                },
                color: "#fcba03",
              },
              grid: {
                display: false,
                color: "#d3d3d300",
              },
            },
            x3: {
              display: false,
              position: "top",
              ticks: {
                display: false,
                callback: function (value, index) {
                  // Map index to a new labels array for the second axis
                  return userDistribution
                    ? pastDistribution.short[index]
                      ? formatCount(pastDistribution.short[index], false)
                      : undefined
                    : undefined;
                },
                font: {
                  family: "'SF Mono Round'",
                  size: 10,
                },
                color: "#44c1cf",
              },
              grid: {
                display: false,
                color: "#d3d3d300",
              },
            },
            y: {
              display: false,
              position: "left",
              title: {
                display: false,
                text: "Emissions", // Label for the X-axis
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
                  return totalInvest > 0 ? value.toFixed(1) : "";
                },
                font: {
                  family: "'SF Mono Round'",
                  size: 10,
                },
                color: "#999999",
              },
            },
            y2: {
              display: false,
              position: "right",
              title: {
                display: false,
                text: "Emissions", // Label for the X-axis
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
                  return totalInvest > 0 ? value.toFixed(1) : "";
                },
                font: {
                  family: "'SF Mono Round'",
                  size: 10,
                },
                color: "#999999",
              },
            },
          },
        },
      });
    }
  }, [
    userDistribution,
    pastDistribution,
    totalDistribution,
    antiTokens,
    proTokens,
    antiData,
    proData,
    dollarStake,
    antiUsage,
    proUsage,
    dollarBet,
    totalInvest,
    wallet,
    bags,
    wallet.disconnecting,
    antiBalance,
    proBalance,
    splitPercentage,
    baryonTokens,
    photonTokens,
  ]);

  const handlePrediction = async () => {
    if (disabled || loading) return;

    try {
      setLoading(true);

      // Validate input
      if (antiTokens <= 0 && proTokens <= 0) {
        toast.error("You must predict with at least some tokens!");
        return;
      }

      if (
        Math.abs(antiTokens - proTokens) < 1 &&
        Math.abs(antiTokens - proTokens) !== 0
      ) {
        toast.error("Token difference must be larger than 1, or exactly 0!");
        return;
      }

      if (antiTokens + proTokens < 1 && antiTokens + proTokens !== 0) {
        toast.error("Token sum must be larger than 1, or exactly 0!");
        return;
      }

      if (antiTokens > antiBalance || proTokens > proBalance) {
        toast.error("You cannot predict with more tokens than you have!");
        return;
      }

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
      const timestamp = new Date().toISOString();
      // Record the prediction
      await recordPrediction(wallet.publicKey.toString(), {
        antiTokens: antiTokens + antiUsage,
        proTokens: proTokens + proUsage,
        baryonTokens: baryonTokens,
        photonTokens: photonTokens,
        signature,
        timestamp,
      });
      // Create prediction data object
      const prediction = {
        antiTokens: antiTokens + antiUsage,
        proTokens: proTokens + proUsage,
        baryonTokens: baryonTokens,
        photonTokens: photonTokens,
        signature,
        timestamp: timestamp,
        wallet: wallet.publicKey.toString(),
      };
      setGain(newGain);
      onPredictionSubmitted(true, prediction);
      toast.success("Your prediction has been recorded!");
    } catch (error) {
      console.error("VOTE_SUBMISSION_FAILED:", error);
      toast.error("An error occurred while recording your prediction");
      setDollarBet(0);
      onPredictionSubmitted(false, { error: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPastDistribution(calculateCollision(baryonBalance, photonBalance, true));
    if (totalInvest > 0) {
      setTotalDistribution(
        calculateCollision(antiUsage + antiTokens, proUsage + proTokens)
      );
      setUserDistribution(calculateCollision(antiTokens, proTokens));
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
      setTotalDistribution(
        calculateCollision(baryonBalance, photonBalance, true)
      );
    }
  }, [
    antiTokens,
    proTokens,
    baryonTokens,
    photonTokens,
    baryonBalance,
    photonBalance,
    totalInvest,
  ]);

  const handleTimeframeChange = (timeframe) => {
    setPredictionHistoryTimeframe(timeframe);
    // TODO: reload data with a different timeframe
  };

  const updateSplit = (total, percentage) => {
    const pro = (percentage / 100) * total;
    const anti = total - pro;
    if (!proData || !antiData) {
      return;
    }
    setDollarBet(pro * proData.priceUsd + anti * antiData.priceUsd);
    setDollarStake(
      (proUsage + pro) * proData.priceUsd +
        (antiUsage + anti) * antiData.priceUsd
    );
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

  return (
    <div className="flex flex-col items-center justify-center w-full bg-black border-x border-b border-gray-800 rounded-b-lg p-5 relative">
      <div className="flex flex-col items-center bg-dark-card p-4 rounded w-full mb-4">
        <div className="w-full">
          <div className="flex flex-row justify-between items-center text-sm text-gray-500">
            <div className="flex text-left text-xs">
              <div className="relative group">
                <div className="cursor-pointer">&#9432;&nbsp;</div>
                <span className="absolute text-sm p-2 bg-gray-800 rounded-md w-64 -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block">
                  Displays your tokens in the pool
                </span>
              </div>
              <div>&nbsp;{`Total`}:&nbsp;</div>
              <div className="flex flex-row justify-center font-sfmono pt-[0px] lg:pt-[1px]">
                <div className={`text-accent-secondary text-[11px] opacity-95`}>
                  {proUsage > 0 ? "+" : ""}
                  {formatCount(proUsage.toFixed(2))}
                </div>
                <div>/</div>
                <div className={`text-accent-primary text-[11px] opacity-95`}>
                  {antiUsage > 0 ? "+" : ""}
                  {formatCount(antiUsage.toFixed(2))}
                </div>
              </div>
            </div>
            <div className="flex flex-row text-right text-[12px]">
              <div className="flex flex-row text-right">
                <span>&nbsp;P/L:&nbsp;</span>
                <span className="text-[11px] text-white font-sfmono pt-[0px] lg:pt-[1px]">
                  <span
                    className={`text-${
                      gain >= 0 ? "accent-secondary" : "accent-primary"
                    } opacity-95`}
                  >
                    {formatCount(gain.toFixed(2))}%&nbsp;
                  </span>
                </span>
                <span className="relative group">
                  <div className="cursor-pointer text-xs mt-[2px]">&#9432;</div>
                  <span className="absolute text-sm p-2 bg-gray-800 rounded-md w-64 -translate-x-[224px] lg:-translate-x-[55px] -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block">
                    {`Displays your current maximum gain`}
                  </span>
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-row justify-between text-[12px] text-gray-500">
            <div className="flex flex-row text-right">
              <div className="flex flex-row text-right">
                <span className="relative group">
                  <div className="cursor-pointer text-xs mt-[1px]">&#9432;</div>
                  <span className="absolute text-sm p-2 bg-gray-800 rounded-md w-64 -translate-x-[224px] lg:-translate-x-[55px] -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block">
                    {`Displays your current dollar stake`}
                  </span>
                </span>
              </div>
              <div>
                &nbsp;{" "}USD:{" "}
                <span className="text-[11px] text-white font-sfmono">
                  <span className="text-gray-400">$</span>
                  {dollarStake >= 1e4
                    ? formatCount(dollarStake.toFixed(2))
                    : dollarStake.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="flex flex-row text-right">
              <div>
                ↓{" "}
                <span className="text-[11px] text-white font-sfmono">
                  <span className="text-gray-400">$</span>
                  {dollarBet >= 1e4
                    ? formatCount(dollarBet.toFixed(2))
                    : dollarBet.toFixed(2)}
                </span>
              </div>
              &nbsp;
              <div className="flex flex-row text-right">
                <div>
                  &nbsp;P/L:{" "}
                  <span className="text-[11px] text-white font-sfmono pt-[2px]">
                    <span
                      className={`text-${
                        newGain >= 0 ? "accent-secondary" : "accent-primary"
                      } opacity-95`}
                    >
                      {formatCount(newGain.toFixed(2))}
                      %&nbsp;
                    </span>
                  </span>
                </div>
                <span className="relative group">
                  <div className="cursor-pointer text-xs mt-[1px]">&#9432;</div>
                  <span className="absolute text-sm p-2 bg-gray-800 rounded-md w-64 -translate-x-[224px] lg:-translate-x-[55px] -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block">
                    {`Displays your current bet and updated maximum gain`}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Token Input Fields */}
      <div className="flex flex-col items-center bg-dark-card p-4 rounded w-full">
        <div className="w-full space-y-2">
          <input
            id="totalInvest"
            type="number"
            onFocus={(e) => e.target.select()}
            value={Math.abs(totalInvest) || ""}
            onChange={handleTotalInvestChange}
            onWheel={(e) => e.target.blur()}
            disabled={inactive}
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
            disabled={inactive}
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
                className="text-accent-secondary font-medium text-sm relative group"
                onClick={() => copyText(process.env.NEXT_PUBLIC_PRO_TOKEN_MINT)}
              >
                {`${process.env.NEXT_PUBLIC_TEST_TOKENS === "true" ? "t" : ""}PRO`}
                <span className="absolute text-sm p-2 bg-gray-800 rounded-md w-32 -translate-x-0 lg:-translate-x-1/4 -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block font-normal">
                  {`Click to copy CA`}
                </span>
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
                disabled={inactive}
              />
            </div>
            <div className={inactive ? "hidden" : "text-xs"}>
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
                disabled={inactive}
              />
              <span className="border-l border-gray-400/50 h-[0.8rem]"></span>
              <label
                htmlFor="antiTokens"
                className="text-accent-orange font-medium text-sm relative group"
                onClick={() =>
                  copyText(process.env.NEXT_PUBLIC_ANTI_TOKEN_MINT)
                }
              >
                {`${process.env.NEXT_PUBLIC_TEST_TOKENS === "true" ? "t" : ""}ANTI`}
                <span className="absolute text-sm p-2 bg-gray-800 rounded-md w-32 -translate-x-3/4 lg:-translate-x-1/2 -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block font-normal">
                  {`Click to copy CA`}
                </span>
              </label>
            </div>
            <div className={inactive ? "hidden" : "text-xs"}>
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
      {userDistribution && lineChartData && totalInvest > 0 && (
        <>
          <div className="flex flex-row justify-center gap-2 items-center font-grotesk text-gray-200 mt-4">
            <div className="-mt-1">Your Predictions</div>
            <div className="relative group">
              <div className="cursor-pointer text-xs text-gray-400">
                &#9432;
              </div>
              <span className="absolute text-sm p-2 bg-gray-800 rounded-md w-64 -translate-x-3/4 lg:-translate-x-1/2 -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block z-50">
                {`Displays your current, past and net predictions`}
              </span>
            </div>
          </div>
          <div
            className={
              inactive
                ? "hidden"
                : "h-[200px] border border-gray-800 rounded-md px-2 pb-4"
            }
          >
            <Line data={lineChartData} options={lineChartData.options} />
          </div>
        </>
      )}

      {/* Submit Button */}
      <button
        onClick={handlePrediction}
        disabled={loading || inactive}
        className={`w-full mt-4 py-3 rounded-full transition-all ${
          loading ||
          inactive ||
          (antiTokens === 0 && proTokens === 0) ||
          (Math.abs(antiTokens - proTokens) < 1 &&
            Math.abs(antiTokens - proTokens) !== 0) ||
          (antiTokens + proTokens < 1 && antiTokens + proTokens !== 0)
            ? "bg-gray-500 text-gray-300 cursor-not-allowed"
            : "bg-accent-primary text-white hover:bg-accent-secondary hover:text-black"
        }`}
      >
        {inactive
          ? "Closed"
          : (Math.abs(antiTokens - proTokens) < 1 &&
              Math.abs(antiTokens - proTokens) !== 0) ||
            (antiTokens + proTokens < 1 && antiTokens + proTokens !== 0)
          ? "Submit"
          : loading
          ? isMetaLoading
            ? "Loading..."
            : "Submitting..."
          : "Submit"}
      </button>
      <ToastContainer {...toastContainerConfig} />
      <p
        className={`mt-1 text-sm font-sfmono text-center ${
          wallet.connected ? "text-gray-300" : "text-red-500 animate-pulse"
        }`}
      >
        {wallet.connected ? "" : "Connect your wallet to enable predictions"}
      </p>
    </div>
  );
};

export default Collider;
