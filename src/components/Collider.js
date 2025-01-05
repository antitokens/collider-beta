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
  emptyConfig,
  emptyBags,
  emptyMetadata,
  formatCount,
  formatPrecise,
  generateGradientColor,
  convertToLocaleTime,
  parseDateToISO,
  shortenTick,
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
  antiData,
  proData,
  config = emptyConfig,
  isMobile = false,
  bags = emptyBags,
  balances = emptyMetadata,
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
  const [predictionHistoryChartData, setPredictionHistoryChartData] =
    useState(null);
  const [lineChartData, setLineChartData] = useState(null);
  const [totalInvest, setTotalInvest] = useState(0);
  const [dollarBet, setDollarBet] = useState(0);
  const [dollarStake, setDollarStake] = useState(0);
  const [gain, setGain] = useState(0);
  const [newGain, setNewGain] = useState(0);
  const [splitPercentage, setSplitPercentage] = useState(50);
  const [predictionHistoryTimeframe, setPredictionHistoryTimeframe] =
    useState("1D");
  const sliderRef = useRef(null);

  useEffect(() => {
    setLoading(isMetaLoading);
  }, [isMetaLoading]);

  const xAxisLabelPlugin = {
    id: "xAxisLabel",
    afterDraw: (chart) => {
      const ctx = chart.ctx;
      const xAxis = chart.scales.x;
      // Style settings for the label
      ctx.font = "8px 'SF Mono Round'";
      ctx.fillStyle = "#666666";
      ctx.textBaseline = "middle";
      // Position calculation
      // This puts the label near the end of x-axis, slightly above it
      const x = xAxis.right - 30; // Shift left from the end
      const y = xAxis.top - 5; // Shift up from the axis
      // Draw the label
      ctx.fillText("Time (UTC)", x, y);
    },
  };

  const verticalLinesPlugin = {
    id: "verticalLines",
    beforeDatasetsDraw: (chart, _, pluginOptions) => {
      const { markerDates, labels, useHourly } = pluginOptions;
      const ctx = chart.ctx;
      const xAxis = chart.scales.x;
      const yAxis = chart.scales.y;
      const local = new Date();
      markerDates.forEach((date, index) => {
        const localDate = new Date(
          new Date(date).getTime() + local.getTimezoneOffset() * 60000
        );
        const _date_ = useHourly
          ? localDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              hour12: true,
            })
          : localDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
        const dateStr = shortenTick(_date_, useHourly);
        const xPosition = xAxis.getPixelForValue(dateStr);
        if (!xPosition) return;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(xPosition, yAxis.top);
        ctx.lineTo(xPosition, yAxis.bottom);
        ctx.lineWidth = 1;
        ctx.strokeStyle = index === 0 ? "#c4c4c488" : "#c4c4c488";
        ctx.stroke();
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillStyle = index === 0 ? "#c4c4c488" : "#c4c4c488";
        ctx.font = "10px 'SF Mono Round'";
        ctx.translate(xPosition + 5, yAxis.top + 35);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(labels[index], 0, 0);
        ctx.restore();
      });
    },
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

  useEffect(() => {
    const useHourly = balances.eventsOverTime.cumulative.timestamps[0]
      ? balances.eventsOverTime.cumulative.timestamps[0]
          .toString()
          .endsWith("AM") ||
        balances.eventsOverTime.cumulative.timestamps[0]
          .toString()
          .endsWith("PM")
      : false;
    const getSegmentColor = (context) => {
      const _start =
        context.p0DataIndex +
        balances.eventsOverTime.cumulative.timestamps.findIndex((timestamp) =>
          parseDateToISO(timestamp, useHourly)
        );
      const _end =
        context.p1DataIndex +
        balances.eventsOverTime.cumulative.timestamps.findIndex((timestamp) =>
          parseDateToISO(timestamp, useHourly)
        );
      const start = balances.eventsOverTime.cumulative.photon[_start];
      const end = balances.eventsOverTime.cumulative.photon[_end];
      const limits = [
        Math.min(...balances.eventsOverTime.cumulative.photon),
        Math.max(...balances.eventsOverTime.cumulative.photon),
      ];
      const currentTick = parseDateToISO(
        balances.eventsOverTime.cumulative.timestamps[_start],
        useHourly
      );
      const nextTick = parseDateToISO(
        balances.eventsOverTime.cumulative.timestamps[_end],
        useHourly
      );
      const nowTime = new Date().toISOString();
      // Past segments should be null
      if (nextTick <= config.startTime) {
        return "rgba(255, 0, 0, 0.25)";
      }
      // Future segments should be grey
      if (currentTick > nowTime && nextTick > nowTime) {
        return "rgba(128, 128, 128, 0.5)";
      }
      // Far future segments should be null
      if (currentTick > config.endTime) {
        return "rgba(128, 0, 0, 0.0)";
      }
      // Segment crossing nowTime - gradient from color to grey
      if (currentTick <= nowTime && nextTick > nowTime) {
        const gradient = context.chart.ctx.createLinearGradient(
          context.p0.x,
          context.p0.y,
          context.p1.x,
          context.p1.y
        );
        gradient.addColorStop(
          0,
          generateGradientColor(
            start,
            limits[0],
            limits[1],
            [66, 255, 214],
            [3, 173, 252]
          )
        );
        gradient.addColorStop(1, "rgba(128, 128, 128, 0.5)");
        return gradient;
      }
      // Past segments (both ticks before nowTime)
      if (currentTick <= nowTime && nextTick <= nowTime) {
        const gradient = context.chart.ctx.createLinearGradient(
          context.p0.x,
          context.p0.y,
          context.p1.x,
          context.p1.y
        );
        gradient.addColorStop(
          0,
          generateGradientColor(
            start,
            limits[0],
            limits[1],
            [66, 255, 214],
            [3, 173, 252]
          )
        );
        gradient.addColorStop(
          1,
          generateGradientColor(
            end,
            limits[0],
            limits[1],
            [66, 255, 214],
            [3, 173, 252]
          )
        );
        return gradient;
      }
      // Fallback (shouldn't reach here)
      return "rgba(128, 128, 128, 0.5)";
    };
    setPredictionHistoryChartData({
      type: "line",
      labels: balances.eventsOverTime.cumulative.timestamps
        .filter((timestamp) => {
          const dateISO = parseDateToISO(timestamp, useHourly);
          return dateISO;
        })
        .map((value) => shortenTick(value, useHourly)),
      datasets: [
        {
          label: "Yes",
          data: balances.eventsOverTime.cumulative.timestamps
            .map((timestamp, index) => {
              const dateISO = parseDateToISO(timestamp, useHourly);
              if (dateISO) {
                const pro = balances.eventsOverTime.cumulative.pro[index];
                const anti = balances.eventsOverTime.cumulative.anti[index];
                const total = pro + anti;
                return total === 0 ? 0 : (pro / total) * 100;
              }
              return null;
            })
            .filter((value) => value !== null),
          segment: {
            borderCapStyle: "round",
            borderColor: getSegmentColor,
          },
          tension: 0,
          borderWidth: 2,
          pointRadius: 0,
          hoverBackgroundColor: "#ffffff55",
          hoverBorderColor: "#ffffffaa",
        },
        {
          // Add a hidden dataset for the certainty tooltip
          label: "Certainty",
          data: balances.eventsOverTime.cumulative.timestamps
            .map((timestamp, index) => {
              const dateISO = parseDateToISO(timestamp, useHourly);
              if (dateISO) {
                return (
                  (balances.eventsOverTime.cumulative.photon[index] /
                    (balances.eventsOverTime.cumulative.photon[index] +
                      balances.eventsOverTime.cumulative.baryon[index])) *
                  100
                );
              }
              return null;
            })
            .filter((value) => value !== null),
          display: false,
          hidden: false,
          pointRadius: 0,
          pointHoverRadius: 0,
          borderWidth: 0,
          hoverBorderWidth: 0,
          hoverBackgroundColor: "transparent",
          hoverBorderColor: "transparent",
        },
      ],
      plugins: [verticalLinesPlugin, xAxisLabelPlugin],
      options: {
        responsive: true,
        interaction: {
          intersect: false,
          mode: "index",
        },
        plugins: {
          verticalLines:
            config.startTime === "-" || config.endTime === "-"
              ? { markerDates: [], labels: [], useHourly: useHourly }
              : {
                  markerDates:
                    config.startTime === "-" || config.endTime === "-"
                      ? []
                      : [config.startTime, config.endTime],
                  labels:
                    config.startTime === "-" || config.endTime === "-"
                      ? []
                      : ["OPEN", "CLOSE"],
                  useHourly: useHourly,
                },
          datalabels: {
            display: false,
          },
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.raw;
                const currentTick = parseDateToISO(
                  balances.eventsOverTime.cumulative.timestamps.find(
                    (timestamp) =>
                      shortenTick(timestamp, useHourly) ===
                      context.chart.data.labels[context.dataIndex]
                  ),
                  useHourly
                );
                const nowTime = new Date().toISOString();
                if (currentTick > nowTime) {
                  return ` -`;
                }
                return ` ${value.toFixed(0).padStart(2)}% ${
                  context.datasetIndex === 0 ? "expectation" : "uncertainty"
                }`;
              },
              labelColor: (context) => {
                const value = context.raw;
                const limits = [
                  Math.min(...balances.eventsOverTime.cumulative.photon),
                  Math.max(...balances.eventsOverTime.cumulative.photon),
                ];
                const currentTick = parseDateToISO(
                  balances.eventsOverTime.cumulative.timestamps.find(
                    (timestamp) =>
                      shortenTick(timestamp, useHourly) ===
                      context.chart.data.labels[context.dataIndex]
                  ),
                  useHourly
                );
                const nowTime = new Date().toISOString();
                // Future segments should be grey
                if (currentTick > nowTime) {
                  return {
                    backgroundColor: "#94949477",
                    borderColor: "#94949477",
                  };
                }
                return {
                  backgroundColor: generateGradientColor(
                    value,
                    context.datasetIndex === 0 ? 0 : limits[0],
                    context.datasetIndex === 0 ? 100 : limits[1],
                    context.datasetIndex === 0 ? [255, 51, 0] : [66, 255, 214],
                    context.datasetIndex === 0 ? [0, 219, 84] : [3, 173, 252]
                  ),
                  borderColor: generateGradientColor(
                    value,
                    context.datasetIndex === 0 ? 0 : limits[0],
                    context.datasetIndex === 0 ? 100 : limits[1],
                    context.datasetIndex === 0 ? [255, 51, 0] : [66, 255, 214],
                    context.datasetIndex === 0 ? [0, 219, 84] : [3, 173, 252]
                  ),
                };
              },
            },
            bodyFont: {
              family: "'SF Mono Round'",
            },
            titleFont: {
              family: "'Space Grotesk'",
              size: 14,
            },
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              font: {
                family: "'SF Mono Round'",
                size: 10,
              },
              color: "#d3d3d399",
            },
          },
          y: {
            grid: {
              display: true,
              color: "rgba(255, 255, 255, 0.1)",
            },
            ticks: {
              callback: function (value) {
                return value === 0 ? "NO" : value === 100 ? "YES" : value + "%";
              },
              stepSize: 10,
              font: {
                family: "'SF Mono Round'",
                size: 10,
              },
              color: function (context) {
                const value = context.tick.value;
                return generateGradientColor(
                  value,
                  0,
                  100,
                  [255, 51, 0],
                  [0, 219, 84]
                );
              },
            },
            min: 0,
            max: 100,
          },
        },
      },
    });
  }, [balances, config]);

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
        setGain(
          originalPosition > 0
            ? (Math.abs(rewardCurrent.change.gain[myBag]) / originalPosition) *
                100
            : 0
        );
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
        updatedBaryonBags[myBag] += baryonTokens;
        updatedPhotonBags[myBag] += photonTokens;
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
              bags.wallets
            )
          : undefined;

      if (myBag >= 0) {
        setNewGain(
          dollarStake > 0
            ? (Math.abs(rewardUpdated.change.gain[myBag]) / dollarStake) * 100
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
                text: "Your Prediction", // Label for the X-axis
                font: {
                  family: "'SF Mono Round'",
                  size: 12,
                  weight: "bold",
                },
                color: "#999999",
              },
              ticks: {
                display: totalInvest > 0,
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
                color: "#d3d3d322",
              },
            },
            x2: {
              position: "top",
              ticks: {
                display: totalInvest > 0,
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
                color: "#d3d3d300",
              },
            },
            x3: {
              position: "top",
              ticks: {
                display: totalInvest > 0,
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
                color: "#d3d3d300",
              },
            },
            y: {
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
      <div className="bg-dark-card p-4 rounded w-full mb-4">
        <h2 className="text-2xl text-white text-center font-medium mb-2">
          Will BTC hit $1m in 2025?
        </h2>
        <div className="flex flex-row justify-between">
          <div className="text-[12px] text-gray-500 text-left">
            <span className="relative group">
              <span className="cursor-pointer">
                &#9432;
                <span className="absolute text-sm p-2 bg-gray-800 rounded-md w-64 translate-x-0 lg:translate-x-0 -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block">
                  {isMobile
                    ? `Prediction market opening date & time: ${
                        config.startTime !== "-"
                          ? !isMobile
                            ? convertToLocaleTime(
                                config.startTime,
                                isMobile
                              ).split(",")[0]
                            : convertToLocaleTime(config.startTime, isMobile)
                          : "-"
                      }`
                    : "Prediction market opening date & time"}
                </span>
              </span>
            </span>{" "}
            &nbsp;Open:{" "}
            <span className="font-sfmono text-gray-400 text-[11px]">
              {config.startTime !== "-"
                ? isMobile
                  ? convertToLocaleTime(config.startTime, isMobile).split(
                      ","
                    )[0]
                  : convertToLocaleTime(config.startTime, isMobile)
                : "-"}
            </span>{" "}
          </div>
          <div className="text-[12px] text-gray-500 text-right">
            Close:{" "}
            <span className="font-sfmono text-gray-400 text-[11px]">
              {config.endTime !== "-"
                ? isMobile
                  ? convertToLocaleTime(config.endTime, isMobile).split(",")[0]
                  : convertToLocaleTime(config.endTime, isMobile)
                : "-"}
            </span>{" "}
            &nbsp;
            <span className="relative group">
              <span className="cursor-pointer">
                &#9432;
                <span className="absolute text-sm p-2 bg-gray-800 rounded-md w-64 -translate-x-[140px] lg:translate-x-0 -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block">
                  {isMobile
                    ? `Prediction market closing date & time: ${
                        config.endTime !== "-"
                          ? !isMobile
                            ? convertToLocaleTime(
                                config.endTime,
                                isMobile
                              ).split(",")[0]
                            : convertToLocaleTime(config.endTime, isMobile)
                          : "-"
                      }`
                    : "Prediction market closing date & time"}
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
            <span className="font-sfmono text-accent-secondary text-[11px] text-opacity-80">
              {formatCount(config.proLive)}
            </span>
            {"/"}
            <span className="font-sfmono text-accent-primary text-[11px] text-opacity-90">
              {formatCount(config.antiLive)}
            </span>
            {"/"}
            <span className="font-sfmono text-gray-400 text-opacity-75">
              {"$"}
              <span className="font-sfmono text-gray-300 text-[11px] text-opacity-90">
                {antiData && proData
                  ? formatCount(
                      config.proLive * Number(proData.priceUsd) +
                        config.antiLive * Number(antiData.priceUsd)
                    )
                  : "-"}
              </span>
              {""}
            </span>
          </div>
          <div className="text-[12px] text-gray-500 text-right">
            {isMobile ? "Ratio:" : "Token Ratio:"}{" "}
            <span className="font-sfmono text-gray-400 text-[11px]">
              {config.antiLive > 0 && config.proLive > 0
                ? (config.proLive / config.antiLive).toFixed(3)
                : "0.000"}
            </span>{" "}
            &nbsp;
            <span className="relative group">
              <span className="cursor-pointer">
                &#9432;
                <span className="absolute text-sm p-2 bg-gray-800 rounded-md w-64 -translate-x-[134px] lg:-translate-x-[55px] -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block">
                  Ratio PRO:ANTI in the prediction pool
                </span>
              </span>
            </span>
          </div>
        </div>
      </div>
      <div
        className={inactive ? "hidden" : "mb-4 bg-dark-card p-4 rounded w-full"}
      >
        {predictionHistoryChartData && (
          <div
            className={`flex flex-col ${
              loading ? "items-center" : "items-end"
            } gap-1`}
          >
            <div
              className={`flex gap-1 mt-4 font-sfmono ${
                loading ? "hidden" : ""
              }`}
            >
              <div
                className={
                  predictionHistoryTimeframe === "1H"
                    ? "timeframe-pill-active"
                    : "timeframe-pill"
                }
                onClick={() => {}}
              >
                <span className="text-xs opacity-75">1H</span>
              </div>
              <div
                className={
                  predictionHistoryTimeframe === "6H"
                    ? "timeframe-pill-active"
                    : "timeframe-pill"
                }
                onClick={() => {}}
              >
                <span className="text-xs opacity-75">6H</span>
              </div>
              <div
                className={
                  predictionHistoryTimeframe === "1D"
                    ? "timeframe-pill-active"
                    : "timeframe-pill"
                }
                onClick={() => {}}
              >
                <span className="text-xs opacity-75">1D</span>
              </div>
              <div
                className={
                  predictionHistoryTimeframe === "1W"
                    ? "timeframe-pill-active"
                    : "timeframe-pill"
                }
                onClick={() => {}}
              >
                <span className="text-xs opacity-75">1W</span>
              </div>
              <div
                className={
                  predictionHistoryTimeframe === "1M"
                    ? "timeframe-pill-active"
                    : "timeframe-pill"
                }
                onClick={() => {}}
              >
                <span className="text-xs opacity-75">1M</span>
              </div>
              <div
                className={
                  predictionHistoryTimeframe === "ALL"
                    ? "timeframe-pill-active"
                    : "timeframe-pill"
                }
                onClick={() => handleTimeframeChange("ALL")}
              >
                <span className="text-xs">ALL</span>
              </div>
              <div className="font-grotesk">
                <div className="relative group">
                  <div className="cursor-pointer text-xs text-gray-500">
                    &nbsp;&#9432;
                  </div>
                  <span className="absolute text-sm p-2 bg-gray-800 rounded-md w-64 -translate-x-3/4 lg:-translate-x-1/2 -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block">
                    {`Displays the global expectation of the outcome over time`}
                  </span>
                </div>
              </div>
            </div>
            {!isMetaLoading ? (
              <Line
                data={predictionHistoryChartData}
                options={predictionHistoryChartData.options}
                plugins={predictionHistoryChartData.plugins}
              />
            ) : (
              <div className="flex flex-col px-4 py-8">
                <BinaryOrbit
                  size={isMobile ? 100 : 100}
                  orbitRadius={isMobile ? 35 : 35}
                  particleRadius={isMobile ? 10 : 10}
                  padding={10}
                  invert={false}
                />
              </div>
            )}
          </div>
        )}
      </div>
      {/* Token Input Fields */}
      <div className="flex flex-col items-center bg-dark-card p-4 rounded w-full">
        <div className="text-lg text-gray-300">Predict</div>
        <div className="w-full space-y-2 mt-4">
          <div>
            <div className="flex flex-row justify-between items-center text-sm text-gray-500">
              <div className="flex text-left text-xs">
                <div className="relative group">
                  <div className="cursor-pointer">&#9432;&nbsp;</div>
                  <span className="absolute text-sm p-2 bg-gray-800 rounded-md w-64 -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block">
                    Displays your current tokens in the pool
                  </span>
                </div>
                <div>&nbsp;Your Pool:&nbsp;</div>
                <div className="flex flex-row justify-center font-sfmono pt-[0px] lg:pt-[1px]">
                  <div className="text-accent-secondary text-[11px] opacity-95">
                    {formatCount(proUsage.toFixed(2))}
                  </div>
                  <div>/</div>
                  <div className="text-accent-primary text-[11px] opacity-95">
                    {formatCount(antiUsage.toFixed(2))}
                  </div>
                </div>
              </div>
              <div className="flex flex-row text-right text-[12px]">
                <div>
                  In USD:{" "}
                  <span className="text-[11px] text-white font-sfmono">
                    <span className="text-gray-400">$</span>
                    {formatCount(dollarStake.toFixed(2))}
                  </span>{" "}
                </div>
                &nbsp;
                <div className="flex flex-row text-right">
                  <span>&nbsp;P/L:&nbsp;</span>
                  <span className="text-[11px] text-white font-sfmono pt-[0px] lg:pt-[1px]">
                    <span className="text-accent-secondary opacity-95">
                      {formatCount(gain.toFixed(2))}%&nbsp;
                    </span>
                  </span>
                  <span className="relative group">
                    <div className="cursor-pointer text-xs mt-[2px]">
                      &#9432;
                    </div>
                    <span className="absolute text-sm p-2 bg-gray-800 rounded-md w-64 -translate-x-[224px] lg:-translate-x-[55px] -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block">
                      {`Displays your current maximum gain`}
                    </span>
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-row justify-between text-[12px] text-gray-500">
              <div className="text-sm">
                {isMobile ? "Add Tokens" : "Add Tokens to Pool"}
              </div>
              <div className="flex flex-row text-right">
                <div>
                  Current Bet:{" "}
                  <span className="text-[11px] text-white font-sfmono">
                    <span className="text-gray-400">$</span>
                    {formatCount(dollarBet.toFixed(2))}
                  </span>
                </div>
                &nbsp;
                <div className="flex flex-row text-right">
                  <div>
                    &nbsp;P/L:{" "}
                    <span className="text-[11px] text-white font-sfmono pt-[2px]">
                      <span className="text-accent-secondary opacity-95">
                        {gain !== newGain
                          ? formatCount(newGain.toFixed(2))
                          : "0"}
                        %&nbsp;
                      </span>
                    </span>
                  </div>
                  <span className="relative group">
                    <div className="cursor-pointer text-xs mt-[1px]">
                      &#9432;
                    </div>
                    <span className="absolute text-sm p-2 bg-gray-800 rounded-md w-64 -translate-x-[224px] lg:-translate-x-[55px] -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block">
                      {`Displays your updated maximum gain`}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
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
                className="text-accent-secondary font-medium text-sm"
              >
                ${process.env.NEXT_PUBLIC_TEST_TOKENS ? "t" : ""}PRO
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
                className="text-accent-orange font-medium text-sm"
              >
                ${process.env.NEXT_PUBLIC_TEST_TOKENS ? "t" : ""}ANTI
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
      {userDistribution && (
        <div className="bg-dark-card p-4 rounded w-full">
          <div className="mb-4 flex flex-row items-center justify-between space-x-2 sm:space-x-10">
            <div className="flex flex-col items-start gap-1/2 w-full">
              <div className="flex flex-row items-center gap-2 bg-black px-3 py-2 rounded w-full">
                <label
                  htmlFor="photonTokens"
                  className="text-gray-300 font-medium text-xs sm:text-sm"
                >
                  ${process.env.NEXT_PUBLIC_TEST_TOKENS ? "t" : ""}PHOTON
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
              <div
                className={
                  inactive ? "hidden" : "text-sm flex flex-row items-center"
                }
              >
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
                  ${process.env.NEXT_PUBLIC_TEST_TOKENS ? "t" : ""}BARYON
                </label>
              </div>
              <div
                className={
                  inactive ? "hidden" : "text-sm flex flex-row items-center"
                }
              >
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

          {lineChartData && totalInvest > 0 && (
            <>
              <div className="flex justify-center gap-2 items-center font-grotesk text-gray-200 -mb-2">
                <div className="-mb-0">Your Predictions</div>
                <div className="relative group">
                  <div className="cursor-pointer">&#9432;</div>
                  <span className="absolute text-sm p-2 bg-gray-800 rounded-md w-64 -translate-x-3/4 lg:-translate-x-1/2 -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block">
                    {`Displays your current, past and net predictions`}
                  </span>
                </div>
              </div>
              <div className={inactive ? "hidden" : "h-[400px]"}>
                <Line data={lineChartData} options={lineChartData.options} />
              </div>
            </>
          )}
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handlePrediction}
        disabled={disabled || loading || inactive}
        className={`w-full mt-4 py-3 rounded-full transition-all ${
          disabled ||
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
          ? "Submitting..."
          : "Submit"}
      </button>
      <ToastContainer {...toastContainerConfig} />
      <p
        className={`mt-1 text-sm font-sfmono ${
          wallet.connected ? "text-gray-300" : "text-red-500 animate-pulse"
        }`}
      >
        {wallet.connected ? "" : "Connect your wallet to enable predictions"}
      </p>
    </div>
  );
};

export default Collider;
