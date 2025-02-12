import { useState, useEffect, useRef } from "react";
import { recordPrediction } from "../utils/api";
import { collide } from "../utils/collider";
import { equalise } from "../utils/equaliser";
import BinaryOrbit from "./animation/BinaryOrbit";
import { ToastContainer } from "react-toastify";
import { Chart, registerables } from "chart.js";
import { Line } from "react-chartjs-2";
import "react-toastify/dist/ReactToastify.css";
import {
  toastContainerConfig,
  toast,
  emptyHoldings,
  formatCount,
  formatPrecise,
  defaultToken,
  copyText,
} from "../utils/utils";
Chart.register(...registerables);

/* Collider Container */
const Collider = ({
  prediction = 0,
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
  holdings = emptyHoldings,
  inactive = true,
  isMetaLoading = true,
}) => {
  const [active, setActive] = useState(inactive);
  const [loading, setLoading] = useState(isMetaLoading);
  const [anti, setAnti] = useState(0);
  const [pro, setPro] = useState(0);
  const [baryon, setBaryon] = useState(0);
  const [photon, setPhoton] = useState(0);
  const [collision, setCollision] = useState(null);
  const [past, setPast] = useState(null);
  const [plasma, setPlasma] = useState(null);
  const [lineChartData, setLineChartData] = useState(null);
  const [totalInvest, setTotalInvest] = useState(0);
  const [dollarBet, setDollarBet] = useState(0);
  const [dollarStake, setDollarStake] = useState(0);
  const [gain, setGain] = useState(0);
  const [newGain, setNewGain] = useState(0);
  const [splitPercentage, setSplitPercentage] = useState(50);
  const sliderRef = useRef(null);

  useEffect(() => {
    setActive(!inactive);
  }, [inactive]);

  useEffect(() => {
    setLoading(isMetaLoading);
  }, [isMetaLoading]);

  useEffect(() => {
    if (sliderRef.current) {
      let percentage = 50;
      if (totalInvest > 0) {
        percentage = (pro / totalInvest) * 100;
      }
      handleSliderInput(percentage);
    }
  }, [pro, totalInvest]);

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
      setAnti(0);
      setPro(0);
      setBaryon(0);
      setPhoton(0);
      setTotalInvest(0);
      setDollarBet(0);
      setSplitPercentage(50);
      handleSliderInput(50);
    }
  }, [clearFields]);

  // Prepare line chart data
  useEffect(() => {
    // Calculate expected rewardCurrents
    let myHolding = -1;
    if (wallet.publicKey) {
      const rewardCurrent =
        holdings !== emptyHoldings
          ? equalise(
              holdings.baryon,
              holdings.photon,
              holdings.anti,
              holdings.pro,
              holdings.antiPool,
              holdings.proPool,
              antiData && proData
                ? [Number(antiData.priceUsd), Number(proData.priceUsd)]
                : [1, 1],
              holdings.wallets,
              [antiUsage > proUsage ? 1 : 0, antiUsage < proUsage ? 1 : 0]
            )
          : undefined;
      myHolding = rewardCurrent
        ? rewardCurrent.change.wallets.indexOf(wallet.publicKey.toString())
        : -1;
      if (proData && antiData && myHolding >= 0) {
        const originalPosition =
          proUsage * proData.priceUsd + antiUsage * antiData.priceUsd;
        if (!wallet.disconnecting) {
          setGain(
            originalPosition !== 0 && (baryonBalance > 0 || photonBalance > 0)
              ? (rewardCurrent.change.gain[myHolding] / originalPosition) * 100
              : 0
          );
        } else {
          setGain(0);
        }
      } else if (proData && antiData && myHolding < 0 && totalInvest > 0) {
        let myFutureHolding = -1;
        let pseudoHoldings = {
          baryon: [...holdings.baryon],
          photon: [...holdings.photon],
          baryonPool: holdings.baryonPool + baryon,
          photonPool: holdings.photonPool + photon,
          anti: [...holdings.anti],
          pro: [...holdings.pro],
          antiPool: holdings.antiPool + anti,
          proPool: holdings.proPool + pro,
          wallets: [...holdings.wallets],
        };
        pseudoHoldings.anti.push(anti);
        pseudoHoldings.pro.push(pro);
        pseudoHoldings.baryon.push(baryon);
        pseudoHoldings.photon.push(photon);
        pseudoHoldings.wallets.push(wallet.publicKey.toString());

        const rewardFuture =
          pseudoHoldings !== emptyHoldings
            ? equalise(
                pseudoHoldings.baryon,
                pseudoHoldings.photon,
                pseudoHoldings.anti,
                pseudoHoldings.pro,
                pseudoHoldings.antiPool,
                pseudoHoldings.proPool,
                antiData && proData
                  ? [Number(antiData.priceUsd), Number(proData.priceUsd)]
                  : [1, 1],
                pseudoHoldings.wallets,
                [anti > pro ? 1 : 0, anti < pro ? 1 : 0]
              )
            : undefined;
        myFutureHolding = rewardFuture
          ? rewardFuture.change.wallets.indexOf(wallet.publicKey.toString())
          : -1;
        const originalPosition =
          pro * proData.priceUsd + anti * antiData.priceUsd;

        if (!wallet.disconnecting) {
          setNewGain(
            originalPosition !== 0 && (baryon > 0 || photon > 0)
              ? (rewardFuture.change.gain[myFutureHolding] / originalPosition) *
                  100
              : 0
          );
        } else {
          setNewGain(0);
        }
      }
    }

    if (collision && plasma && dollarStake) {
      // Trial
      const F = 1;
      const G = 1;
      setBaryon(totalInvest > 0 ? F * plasma.mean : 0);
      setPhoton(totalInvest > 0 ? G * plasma.stddev : 0);

      // Create new arrays with updated values
      const updatedBaryonHoldings = [...holdings.baryon];
      const updatedPhotonHoldings = [...holdings.photon];
      const updatedAntiHoldings = [...holdings.anti];
      const updatedProHoldings = [...holdings.pro];

      if (myHolding >= 0) {
        updatedBaryonHoldings[myHolding] =
          totalInvest > 0 ? F * plasma.mean : baryon;
        updatedPhotonHoldings[myHolding] =
          totalInvest > 0 ? F * plasma.mean : photon;
        updatedAntiHoldings[myHolding] += anti;
        updatedProHoldings[myHolding] += pro;
      }

      const rewardUpdated =
        holdings !== emptyHoldings
          ? equalise(
              updatedBaryonHoldings,
              updatedPhotonHoldings,
              updatedAntiHoldings,
              updatedProHoldings,
              holdings.antiPool + anti,
              holdings.proPool + pro,
              antiData && proData
                ? [Number(antiData.priceUsd), Number(proData.priceUsd)]
                : [1, 1],
              holdings.wallets,
              [
                antiUsage + anti > proUsage + pro ? 1 : 0,
                antiUsage + anti < proUsage + pro ? 1 : 0,
              ]
            )
          : undefined;

      if (myHolding >= 0) {
        setNewGain(
          dollarStake !== 0 &&
            !active &&
            !wallet.disconnecting &&
            totalInvest > 0
            ? (rewardUpdated.change.gain[myHolding] / dollarStake) * 100
            : 0
        );
      }

      setLineChartData({
        type: "line",
        labels: collision.xShort.map((value) =>
          value > 0 ? formatPrecise(value) : ""
        ),
        datasets: [
          {
            label: "Current",
            data:
              totalInvest <= 0
                ? []
                : collision.yShort.map((item) => item.value),
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
                : past
                ? past.yShort.map((item) => item.value)
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
                : plasma
                ? plasma.yShort.map((item) => item.value)
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
                  return collision
                    ? collision.xShort[index]
                      ? formatCount(collision.xShort[index], false)
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
                  return collision
                    ? plasma.xShort[index]
                      ? formatCount(plasma.xShort[index], false)
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
                  return collision
                    ? past.xShort[index]
                      ? formatCount(past.xShort[index], false)
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
    collision,
    past,
    plasma,
    anti,
    pro,
    antiData,
    proData,
    dollarStake,
    antiUsage,
    proUsage,
    dollarBet,
    totalInvest,
    wallet,
    holdings,
    wallet.disconnecting,
    antiBalance,
    proBalance,
    splitPercentage,
    baryon,
    photon,
  ]);

  const handlePrediction = async () => {
    if (disabled || loading) return;

    try {
      setLoading(true);

      // Validate input
      if (anti <= 0 && pro <= 0) {
        toast.error("You must predict with at least some tokens!");
        return;
      }

      if (Math.abs(anti - pro) < 1 && Math.abs(anti - pro) !== 0) {
        toast.error("Token difference must be larger than 1, or exactly 0!");
        return;
      }

      if (anti + pro < 1 && anti + pro !== 0) {
        toast.error("Token sum must be larger than 1, or exactly 0!");
        return;
      }

      if (anti > antiBalance || pro > proBalance) {
        toast.error("You cannot predict with more tokens than you have!");
        return;
      }

      // Prompt for Solana signature
      const message = `Requesting signature to predict with:
        ${anti.toFixed(2)} $ANTI,
        ${pro.toFixed(2)} $PRO,
        for
        ${baryon.toFixed(2)} $BARYON,
        ${photon.toFixed(2)} $PHOTON,
        on prediction ${prediction} with Collider-beta,
        with account ${wallet.publicKey.toString()}`;
      const signatureUint8Array = await wallet.signMessage(
        new TextEncoder().encode(message)
      );
      const signature = btoa(String.fromCharCode(...signatureUint8Array));
      const timestamp = new Date().toISOString();
      // Record the prediction
      await recordPrediction(
        wallet.publicKey.toString(),
        {
          anti: anti + antiUsage,
          pro: pro + proUsage,
          baryon: baryon,
          photon: photon,
          signature,
          timestamp,
        },
        prediction
      );
      // Create prediction record data object
      const record = {
        anti: anti + antiUsage,
        pro: pro + proUsage,
        baryon: baryon,
        photon: photon,
        signature,
        timestamp: timestamp,
        wallet: wallet.publicKey.toString(),
      };
      setGain(newGain);
      onPredictionSubmitted(true, record);
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
    setPast(collide(baryonBalance, photonBalance, true));
    if (totalInvest > 0) {
      setPlasma(collide(antiUsage + anti, proUsage + pro));
      setCollision(collide(anti, pro));
    } else {
      setCollision({
        u: 0,
        s: 0,
        range: [0, 1],
        distribution: [
          { x: 0, value: 0 },
          { x: 1, value: 0 },
        ],
        xShort: [0, 1],
        yShort: [
          { x: 0, value: 0 },
          { x: 1, value: 0 },
        ],
      });
      setPlasma(collide(baryonBalance, photonBalance, true));
    }
  }, [anti, pro, baryon, photon, baryonBalance, photonBalance, totalInvest]);

  const handleTimeframeChange = (timeframe) => {
    setPredictionHistoryTimeframe(timeframe);
    // TODO: reload data with a different timeframe
  };

  const updateSplit = (total, percentage) => {
    const pro = parseFloat(((percentage / 100) * total).toFixed(2));
    const anti = parseFloat((total - pro).toFixed(2));
    if (!proData || !antiData) {
      return;
    }
    setDollarBet(pro * proData.priceUsd + anti * antiData.priceUsd);
    setDollarStake(
      (proUsage + pro) * proData.priceUsd +
        (antiUsage + anti) * antiData.priceUsd
    );
    setPro(pro);
    setAnti(anti);
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

  const handleProChange = (e) => {
    const pro = Math.abs(Number(e.target.value));
    const newTotal = pro + anti;
    updateForm(newTotal, pro, anti);
  };

  const handleAntiChange = (e) => {
    const anti = Math.abs(Number(e.target.value));
    const newTotal = pro + anti;
    updateForm(newTotal, pro, anti);
  };

  const updateForm = (total, pro, anti) => {
    setTotalInvest(total);
    setPro(pro);
    setAnti(anti);

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
                  Displays your tokens in the prediction pool
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
                &nbsp; USD:{" "}
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
            disabled={!active}
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
            disabled={!active}
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
                htmlFor="pro"
                className="text-accent-secondary font-medium text-sm relative group"
                onClick={() => copyText(process.env.NEXT_PUBLIC_PRO_TOKEN_MINT)}
              >
                {`${
                  process.env.NEXT_PUBLIC_TEST_TOKENS === "true" ? "t" : ""
                }PRO`}
                <span className="absolute text-sm p-2 bg-gray-800 rounded-md w-32 -translate-x-0 lg:-translate-x-1/4 -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block font-normal">
                  {`Click to copy CA`}
                </span>
              </label>
              <span className="border-l border-gray-400/50 h-[0.8rem]"></span>
              <input
                id="pro"
                type="number"
                min="0"
                max={proBalance}
                value={Math.abs(pro) || ""}
                onChange={handleProChange}
                onFocus={(e) => e.target.select()}
                onMouseDown={(e) => setPro(0)}
                placeholder="0"
                className="w-full font-sfmono bg-black text-white text-sm"
                disabled={!active}
              />
            </div>
            <div className={!active ? "hidden" : "text-xs"}>
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
                id="anti"
                type="number"
                min="0"
                max={antiBalance}
                value={Math.abs(anti) || ""}
                onChange={handleAntiChange}
                onFocus={(e) => e.target.select()}
                onMouseDown={(e) => setAnti(0)}
                placeholder="0"
                className="w-full font-sfmono bg-black text-white text-xs sm:text-sm text-right"
                disabled={!active}
              />
              <span className="border-l border-gray-400/50 h-[0.8rem]"></span>
              <label
                htmlFor="anti"
                className="text-accent-orange font-medium text-sm relative group"
                onClick={() =>
                  copyText(process.env.NEXT_PUBLIC_ANTI_TOKEN_MINT)
                }
              >
                {`${
                  process.env.NEXT_PUBLIC_TEST_TOKENS === "true" ? "t" : ""
                }ANTI`}
                <span className="absolute text-sm p-2 bg-gray-800 rounded-md w-32 -translate-x-3/4 lg:-translate-x-1/2 -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block font-normal">
                  {`Click to copy CA`}
                </span>
              </label>
            </div>
            <div className={!active ? "hidden" : "text-xs"}>
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
      {collision && lineChartData && totalInvest > 0 && (
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
              !active
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
        disabled={loading || !active || !wallet.connected}
        className={`w-full mt-4 py-3 rounded-full transition-all ${
          loading ||
          !active ||
          (anti === 0 && pro === 0) ||
          (Math.abs(anti - pro) < 1 && Math.abs(anti - pro) !== 0) ||
          (anti + pro < 1 && anti + pro !== 0)
            ? "bg-gray-500 text-gray-300 cursor-not-allowed"
            : "bg-accent-primary text-white hover:bg-accent-secondary hover:text-black"
        }`}
      >
        {!active
          ? "Closed"
          : (Math.abs(anti - pro) < 1 && Math.abs(anti - pro) !== 0) ||
            (anti + pro < 1 && anti + pro !== 0)
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
