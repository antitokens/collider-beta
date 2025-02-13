import React, { useMemo, useState, useEffect, useRef } from "react";
import Head from "next/head";
import { Line } from "react-chartjs-2";
import {
  ConnectionProvider,
  WalletProvider,
  useWallet,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  SolflareWalletAdapter,
  TorusWalletAdapter,
  LedgerWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import Collider from "../components/Collider";
import Inverter from "../components/Inverter";
import { Stars, ParticleCollision } from "../components/animation/Animations";
import { equalise } from "../utils/equaliser";
import Metadata from "../components/Metadata";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import TimeCompletionPie from "../components/animation/TimePie";
import BuyTokenModal from "../components/utils/BuyToken";
import PredictionMetaModal from "../components/meta/AddPrediction";
import BinaryOrbit from "../components/animation/BinaryOrbit";
import {
  ANTI_TOKEN_MINT,
  PRO_TOKEN_MINT,
  getTokenBalance,
} from "../utils/solana";
import {
  toast,
  useIsMobile,
  emptyMetadata,
  metadataInit,
  resolutionInit,
  emptyGaussian,
  emptyHoldings,
  emptyConfig,
  defaultToken,
  detectBinningStrategy,
  generateGradientColor,
  parseDateToISO,
  shortenTick,
  dateToLocal,
  convertToLocaleTime,
  findBinForTimestamp,
  parseCustomDate,
  formatCount,
  TimeTicker,
  parseToUTC,
  findHourBinForTime,
  predictionsInit,
  getPlotColor,
  getAllPlotColor,
  formatTruth,
  addRepetitionMarkers,
} from "../utils/utils";
import {
  getBalance,
  getBalances,
  getWithdrawal,
  getWithdrawals,
  getPredictions,
  getResolution,
  addPrediction,
  checkPredictions,
} from "../utils/api";
import { decompressMetadata } from "../utils/compress";
import { collide } from "../utils/collider";
import "@solana/wallet-adapter-react-ui/styles.css";

/* Main Page */
const Home = ({ BASE_URL }) => {
  const [trigger, setTrigger] = useState(null); // Shared state
  const [metadata, setMetadata] = useState({
    description: "Predict with $ANTI and $PRO tokens",
    ogTitle: "Antitoken Prediction Market",
    ogDescription: "Predict with $ANTI and $PRO tokens",
    ogImage: `${BASE_URL}/assets/antitoken_logo.jpeg`,
    ogUrl: `${BASE_URL}`,
    ogSiteName: "Antitoken",
    xCard: "Antitoken App",
    xTitle: "Antitoken Predicting Station",
    xDescription:
      "Experience the future of prediction markets with $ANTI and $PRO tokens.",
    xImage: `${BASE_URL}/assets/antitoken_logo_large.webp`,
    xSite: "@antitokens",
  });

  return (
    <>
      <Head>
        <title>Antitoken | Predict</title>
        <meta name="description" content={metadata.description} />
        {/* Open Graph Meta Tags */}
        <meta property="og:title" content={metadata.ogTitle} />
        <meta property="og:description" content={metadata.ogDescription} />
        <meta property="og:image" content={metadata.ogImage} />
        <meta property="og:url" content={metadata.ogUrl} />
        <meta property="og:site_name" content={metadata.ogSiteName} />
        {/* X Meta Tags */}
        <meta name="twitter:card" content={metadata.xCard} />
        <meta name="twitter:title" content={metadata.xTitle} />
        <meta name="twitter:description" content={metadata.xDescription} />
        <meta name="twitter:image" content={metadata.xImage} />
        <meta name="twitter:site" content={metadata.xSite} />
        {/* Favicon and Icons */}
        <link
          rel="icon"
          type="image/png"
          href={`${BASE_URL}/assets/favicon/favicon-96x96.png`}
          sizes="96x96"
        />
        <link
          rel="shortcut icon"
          href={`${BASE_URL}/assets/favicon/favicon.ico`}
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href={`${BASE_URL}/assets/favicon/apple-touch-icon.png`}
        />
        <link
          rel="manifest"
          href={`${BASE_URL}/assets/favicon/site.webmanifest`}
        />
      </Head>
      <div className="bg-dark text-gray-100 min-h-screen relative overflow-x-hidden font-grotesk">
        <Stars length={16} />
        <Navbar trigger={trigger} />
        <LandingPage
          BASE_URL={BASE_URL}
          setTrigger={setTrigger}
          setMetadata={setMetadata}
        />
        <Footer />
      </div>
    </>
  );
};

const LandingPage = ({ BASE_URL, setTrigger, setMetadata }) => {
  const wallet = useWallet();
  const [showBuyTokensModal, setShowBuyTokensModal] = useState(false);
  const [prediction, setPrediction] = useState(1);
  const [alreadyPosted, setAlreadyPosted] = useState(false);
  const [newPredictionPosted, setNewPredictionPosted] = useState(false);
  const [predictions, setPredictions] = useState(predictionsInit);
  const [started, setStarted] = useState(false);
  const [isOver, setIsOver] = useState(false);
  const [antiBalance, setAntiBalance] = useState(0);
  const [proBalance, setProBalance] = useState(0);
  const [antiBalanceLive, setAntiBalanceLive] = useState(0);
  const [proBalanceLive, setProBalanceLive] = useState(0);
  const [antiUsage, setAntiUsage] = useState(0);
  const [proUsage, setProUsage] = useState(0);
  const [baryonBalance, setBaryonBalance] = useState(0);
  const [photonBalance, setPhotonBalance] = useState(0);
  const [holdings, setHoldings] = useState(emptyHoldings);
  const [showCollider, setShowCollider] = useState(true);
  const [dataUpdated, setDataUpdated] = useState(false);
  const [clearFields, setClearFields] = useState(false);
  const [antiData, setAntiData] = useState(defaultToken);
  const [proData, setProData] = useState(defaultToken);
  const [showAnimation, setShowAnimation] = useState(false);
  const [currentPredictionData, setCurrentPredictionData] =
    useState(emptyMetadata);
  const [currentWithdrawalData, setCurrentWithdrawalData] =
    useState(emptyMetadata);
  const [balances, setBalances] = useState(metadataInit);
  const [withdrawals, setWithdrawals] = useState(metadataInit);
  const [predictionConfig, setPredictionConfig] = useState(emptyConfig);
  const [isMetaLoading, setIsMetaLoading] = useState(true);
  const [, setIsMetaLoaded] = useState(false);
  const [, setIsPageReload] = useState(false);
  const [metaError, setMetaError] = useState(null);
  const [refresh, setRefresh] = useState(true);
  const [loading, setLoading] = useState(isMetaLoading);
  const [, setDynamicsCurrent] = useState([]);
  const [, setDynamicsFinal] = useState([]);
  const [truth, setTruth] = useState([0, 0]); // ANTI-PRO
  const [triggerAddPrediction, setTriggerAddPrediction] = useState(false);
  const isMobile = useIsMobile();
  const [resolved, setResolved] = useState(false);
  const [triggerResolution, setTriggerResolution] = useState(false);
  const [resolution, setResolution] = useState(null);
  const [predictionHistoryChartData, setPredictionHistoryChartData] =
    useState(null);
  const [predictionHistoryTimeframe, setPredictionHistoryTimeframe] =
    useState("1D");

  useEffect(() => {
    // Check if this is a page reload
    const isReload = sessionStorage.getItem("isReload") === "true";
    setIsPageReload(isReload);
    if (isReload)
      setPrediction(window.location.hash ? window.location.hash.slice(1) : 1);
    // Set flag for next load
    sessionStorage.setItem("isReload", "true");
    // Clean up on component unmount (optional)
    return () => {
      sessionStorage.removeItem("isReload");
    };
  }, []);

  useEffect(() => {
    const fetchBalances = async () => {
      const blobPredictions = await getPredictions();
      const dataPredictions = JSON.parse(blobPredictions.message);
      const addPredictions =
        JSON.stringify(dataPredictions) === "{}"
          ? predictionsInit
          : dataPredictions;
      return addPredictions;
    };

    // Wait for the Promise to resolve before setting the state
    fetchBalances()
      .then((result) => {
        setPredictions(result);
        if (newPredictionPosted) setPrediction(result.length);
      })
      .catch((error) => {
        console.error("Error fetching predictions:", error);
        setPredictions(predictionsInit);
      });
  }, [refresh, newPredictionPosted]);

  useEffect(() => {
    const fetchResolution = async () => {
      const blobResolution = await getResolution(prediction);
      const dataResolution = JSON.parse(blobResolution.message);
      const addResolution =
        JSON.stringify(dataResolution) === "{}"
          ? resolutionInit
          : dataResolution;
      return addResolution;
    };

    if (triggerResolution) {
      // Wait for the Promise to resolve before setting the state
      fetchResolution()
        .then((result) => {
          setResolution(result.resolution);
          setTruth(result.truth);
          setResolved(true);
        })
        .catch((error) => {
          console.error("Error fetching resolution:", error);
          toast.error("Failed to resolve prediction!");
          setResolution(resolutionInit);
          setResolved(false);
        });
    }
  }, [triggerResolution, prediction]);

  useEffect(() => {
    // Update metadata based on some condition or data
    setMetadata({
      description: predictions[prediction]?.title,
      ogDescription: predictions[prediction]?.title,
      xTitle: predictions[prediction]?.title,
      xDescription: predictions[prediction]?.description,
    });
  }, [prediction, predictions]);

  useEffect(() => {
    setLoading(isMetaLoading);
  }, [isMetaLoading]);

  const marker = "₁";

  const xAxisLabelPlugin = {
    id: "xAxisLabel",
    afterDraw: (chart, _, pluginOptions) => {
      const { isMobile } = pluginOptions;
      const ctx = chart.ctx;
      const xAxis = chart.scales.x;
      // Style settings for the label
      ctx.font = isMobile ? "9px 'SF Mono Round'" : "10px 'SF Mono Round'";
      ctx.fillStyle = "#666666";
      ctx.textBaseline = "middle";
      // Position calculation
      // This puts the label near the end of x-axis, slightly above it
      const x = xAxis.right - 15; // Shift left from the end
      const y = xAxis.top + 10; // Shift up from the axis
      // Draw the label
      ctx.fillText("UTC", x, y);
    },
  };

  const verticalLinesPlugin = {
    id: "verticalLines",
    beforeDatasetsDraw: (chart, _, pluginOptions) => {
      const { markers, labels, useBinning, isMobile } = pluginOptions;
      const ctx = chart.ctx;
      const xAxis = chart.scales.x;
      const yAxis = chart.scales.y;
      markers.forEach((date, index) => {
        const localDate = new Date(new Date(date).getTime());
        const item = dateToLocal(localDate, useBinning);
        const dateStr = shortenTick(item, useBinning);
        // Find all occurrences of this date
        const allIndices = chart.data.labels.reduce((acc, label, i) => {
          if (label === dateStr || label === dateStr + marker) acc.push(i);
          return acc;
        }, []);
        // If we have enough occurrences, use the one matching our index
        let xPosition;
        if (allIndices.length > index) {
          xPosition = xAxis.getPixelForValue(allIndices[index]);
        } else {
          // Fallback to first occurrence if we don't have enough matches
          xPosition = xAxis.getPixelForValue(allIndices[0]);
        }
        // Skip if we still don't have a valid position
        if (!xPosition || isNaN(xPosition)) return;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(xPosition, yAxis.top);
        ctx.lineTo(xPosition, yAxis.bottom);
        ctx.strokeStyle = index === 0 ? "#c4c4c488" : "#c4c4c488";
        ctx.stroke();
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillStyle = index === 0 ? "#c4c4c488" : "#c4c4c488";
        ctx.font = isMobile ? "10px 'SF Mono Round'" : "12px 'SF Mono Round'";
        ctx.translate(
          xPosition + 10 * (index > 0 ? 3 / 7 : -16 / 10),
          yAxis.bottom - 5
        );
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(labels[index], 0, 0);
        ctx.restore();
      });
    },
  };

  const nowTimePlugin = {
    id: "nowTime",
    beforeDatasetsDraw: (chart, _, pluginOptions) => {
      if (!chart?.ctx) return;
      const { marker, values, labels, useBinning, isMobile } = pluginOptions;
      if (!marker) return;
      const ctx = chart.ctx;
      const xAxis = chart.scales.x;
      const yAxis = chart.scales.y;
      if (!xAxis || !yAxis) return;

      try {
        marker.forEach((date, index) => {
          if (!date) return;
          const localDate = new Date(new Date(date).getTime());
          const item = dateToLocal(localDate, useBinning);
          const closestBin =
            useBinning !== "hourly"
              ? findBinForTimestamp(
                  parseCustomDate(item),
                  values[0].map((value) =>
                    useBinning !== "daily" && useBinning !== "hourly"
                      ? parseCustomDate(
                          value.replace(
                            /(\w+ \d+), (\d+)/,
                            `$1, ${new Date(date).getFullYear()}, $2`
                          )
                        )
                      : parseCustomDate(value + ", " + new Date().getFullYear())
                  )
                )
              : findHourBinForTime(date.toString(), values[0]);
          const closestBinStr =
            useBinning !== "hourly"
              ? dateToLocal(closestBin, useBinning)
              : closestBin;
          const dateStr =
            useBinning !== "hourly"
              ? shortenTick(closestBinStr, useBinning)
              : closestBinStr;
          const allIndices =
            chart.data.labels?.reduce((acc, label, i) => {
              if (label === dateStr) acc.push(i);
              return acc;
            }, []) || [];
          let xPosition;
          if (allIndices.length > index) {
            xPosition = xAxis.getPixelForValue(allIndices[index]);
          } else if (allIndices.length > 0) {
            xPosition = xAxis.getPixelForValue(allIndices[0]);
          }

          if (!xPosition || isNaN(xPosition)) return;
          const yPosition = yAxis.getPixelForValue(
            values[1][values[0].indexOf(dateStr)]
          );
          if (!yPosition || isNaN(yPosition)) return;
          // Draw marker
          ctx.save();
          ctx.beginPath();
          ctx.arc(xPosition, yPosition, isMobile ? 4 : 6, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(196, 196, 196, 0.5)";
          ctx.fill();
          ctx.strokeStyle = "rgba(196, 196, 196, 0.8)";
          ctx.stroke();

          // Draw label if exists
          if (labels?.[index]) {
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
            ctx.fillStyle = "#c4c4c488";
            ctx.font = isMobile
              ? "10px 'SF Mono Round'"
              : "12px 'SF Mono Round'";
            ctx.translate(
              xPosition + (isMobile ? 3.25 : 5.25),
              yPosition + 9.5
            );
            ctx.rotate(0);
            ctx.fillText(labels[index], 0, 0);
          }
          ctx.restore();
        });
      } catch (error) {
        console.error("Plugin error:", error);
        ctx?.restore();
      }
    },
  };

  const handlePredictionCreation = async (formData) => {
    try {
      setTriggerAddPrediction(false);
      const blobNewPrediction = await addPrediction(
        wallet.publicKey,
        formData,
        predictions.length + 1
      );
      if (blobNewPrediction.status === 202) {
        toast.error(blobNewPrediction.message);
        return;
      }
      // Update predictions state with new prediction
      const updatedPredictions = { ...predictions };
      updatedPredictions[Object.keys(predictions).length + 1] = formData;
      setNewPredictionPosted(true);
      setPredictions(updatedPredictions);
      updatePrediction(Object.keys(updatedPredictions).length, false);
      // Force refresh of balances data
      setRefresh(true);
      // Set alreadyPosted to prevent multiple submissions
      setAlreadyPosted(true);
      toast.success(blobNewPrediction.message);
    } catch (error) {
      console.error("Error creating prediction:", error);
      toast.error("Failed to create prediction");
    }
  };

  const handlePredictionSubmitted = (state, event) => {
    if (state) {
      // Store the submitted event data
      setCurrentPredictionData(event);
      setRefresh(true);
    } else {
      // Handle error case
      console.error("Prediction submission failed:", event.error);
    }
    setDataUpdated(state);
    setTrigger(state);
    // Trigger field clearing
    setClearFields(true);
    setTimeout(() => setClearFields(false), 100);
    setTimeout(() => setShowAnimation(state), 100);
  };

  const handleWithdrawalSubmitted = (state, withdrawal) => {
    if (state) {
      setCurrentWithdrawalData(withdrawal);
      setRefresh(true);
    } else {
      // Handle error case
      console.error("Rewithdrawal submission failed:", withdrawal.error);
    }
    setDataUpdated(state);
    setTrigger(state);
    // Trigger field clearing
    setClearFields(true);
    setTimeout(() => setClearFields(false), 100);
    setTimeout(() => setShowAnimation(state), 100);
  };

  useEffect(() => {
    if (wallet.disconnecting) {
      setShowCollider(true);
    }
  }, [wallet, wallet.disconnecting]);

  useEffect(() => {
    const checkMeta = async () => {
      toast.error("Error fetching metadata from server!");
      return;
    };
    if (metaError) checkMeta();
  }, [metaError]);

  useEffect(() => {
    if (predictions[prediction]?.schedule) {
      setStarted(new Date() > new Date(predictions[prediction].schedule[0]));
      setIsOver(new Date() > new Date(predictions[prediction].schedule[1]));
    }
  }, [predictions, prediction]);

  useEffect(() => {
    if (refresh && !wallet.disconnecting) {
      const fetchBalancesWithWithdrawals = async () => {
        try {
          setIsMetaLoading(true);
          const blobBalance = await getBalances(String(prediction));
          const blobWithdrawal = await getWithdrawals(String(prediction));
          const deposits = decompressMetadata(JSON.parse(blobBalance.message));
          const inversions = decompressMetadata(
            JSON.parse(blobWithdrawal.message)
          );

          // Only check for wallet permissions if wallet is connected
          if (wallet.publicKey) {
            const blobCheck = await checkPredictions(wallet.publicKey);
            const dataCheck = blobCheck.message;
            setAlreadyPosted(dataCheck === "NOT_ALLOWED");
          } else {
            setAlreadyPosted(false); // Reset posting status when wallet disconnects
          }

          const collider =
            baryonBalance >= 0 || photonBalance >= 0
              ? collide(baryonBalance, photonBalance, true)
              : emptyGaussian;

          const plasma =
            deposits.plasma.mean >= 0 && deposits.plasma.stddev >= 0
              ? collide(
                  deposits.emission.baryon,
                  deposits.emission.photon,
                  true
                )
              : emptyGaussian;

          setBalances({
            startTime: deposits.startTime,
            endTime: deposits.endTime,
            collider: collider,
            plasma: plasma,
            emission: deposits.emission,
            collision: deposits.collision,
            events: deposits.events,
          });

          setHoldings({
            baryon: deposits.plasma.balances.baryon,
            photon: deposits.plasma.balances.photon,
            baryonPool: deposits.emission.baryon,
            photonPool: deposits.emission.photon,
            anti: deposits.plasma.balances.anti,
            pro: deposits.plasma.balances.pro,
            antiPool: deposits.collision.anti,
            proPool: deposits.collision.pro,
            wallets: deposits.plasma.wallets,
          });

          const thisAntiUsage = wallet.publicKey
            ? deposits.plasma.balances.anti[
                deposits.plasma.wallets.indexOf(wallet.publicKey.toString())
              ]
            : 0;
          const thisProUsage = wallet.publicKey
            ? deposits.plasma.balances.pro[
                deposits.plasma.wallets.indexOf(wallet.publicKey.toString())
              ]
            : 0;

          const rewardCurrent = equalise(
            deposits.plasma.balances.baryon,
            deposits.plasma.balances.photon,
            deposits.plasma.balances.anti,
            deposits.plasma.balances.pro,
            deposits.collision.anti,
            deposits.collision.pro,
            antiData && proData
              ? [Number(antiData.priceUsd), Number(proData.priceUsd)]
              : [0, 0], // TODO: Handle case of no price data
            deposits.plasma.wallets,
            [
              thisAntiUsage > thisProUsage ? 1 : 0,
              thisAntiUsage < thisProUsage ? 1 : 0,
            ]
          );

          const rewardFinal = equalise(
            deposits.plasma.balances.baryon,
            deposits.plasma.balances.photon,
            deposits.plasma.balances.anti,
            deposits.plasma.balances.pro,
            deposits.collision.anti,
            deposits.collision.pro,
            antiData && proData
              ? [Number(antiData.priceUsd), Number(proData.priceUsd)]
              : [0, 0], // TODO: Handle case of no price data
            deposits.plasma.wallets,
            truth
          );

          setDynamicsCurrent(rewardCurrent ? rewardCurrent.normalised : []);
          setDynamicsFinal(rewardFinal ? rewardFinal.normalised : []);

          setWithdrawals({
            startTime: inversions.startTime,
            endTime: inversions.endTime,
            collider: collider,
            plasma: plasma,
            emission: inversions.emission,
            collision: inversions.collision,
            events: inversions.events,
          });
        } catch (err) {
          if (predictions.length > 0) {
            console.error("Error fetching metadata:", err);
            setMetaError(err);
          } else {
            console.log("Found no predictions in the database");
          }
        } finally {
          setIsMetaLoading(false);
          setIsMetaLoaded(true);
          setRefresh(false);
        }
      };
      // Fetch whenever prediction changes or refresh is triggered
      if (
        prediction >= 0 &&
        (String(prediction) === window.location.hash.slice(1) ||
          !window.location.hash)
      ) {
        fetchBalancesWithWithdrawals();
      }
    }
    if (wallet.disconnecting) {
      setDynamicsCurrent([]);
      setDynamicsFinal([]);
    }
  }, [
    prediction,
    predictions,
    refresh,
    baryonBalance,
    photonBalance,
    antiData,
    proData,
    truth,
    wallet,
    wallet.disconnecting,
    wallet.publicKey,
  ]);

  useEffect(() => {
    setPredictionConfig({
      startTime: predictions[prediction]?.schedule?.[0] || "-",
      endTime: predictions[prediction]?.schedule?.[1] || "-",
      antiLive: balances.collision.anti - withdrawals.collision.anti || 0,
      proLive: balances.collision.pro - withdrawals.collision.pro || 0,
      convertToLocaleTime,
    });
  }, [balances, withdrawals, predictions, prediction]);

  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        // Fetch data for both tokens
        const [antiResponse, proResponse] = await Promise.all([
          fetch(
            `https://api.dexscreener.com/latest/dex/tokens/${process.env.NEXT_PUBLIC_ANTI_TOKEN_MINT}`
          ),
          fetch(
            `https://api.dexscreener.com/latest/dex/tokens/${process.env.NEXT_PUBLIC_PRO_TOKEN_MINT}`
          ),
        ]);

        const antiData = await antiResponse.json();
        const proData = await proResponse.json();

        // Update state for $ANTI and $PRO
        if (!process.env.NEXT_PUBLIC_TEST_TOKENS) {
          if (antiData.pairs && antiData.pairs[0]) {
            setAntiData({
              priceUsd: parseFloat(antiData.pairs[0].priceUsd).toFixed(5),
              marketCap: antiData.pairs[0].fdv,
            });
          }

          if (proData.pairs && proData.pairs[0]) {
            setProData({
              priceUsd: parseFloat(proData.pairs[0].priceUsd).toFixed(5),
              marketCap: proData.pairs[0].fdv,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching token data:", error);
      }
    };
    fetchTokenData();
  }, []);

  useEffect(() => {
    // Only handle URL hash after predictions are loaded
    if (isMetaLoading) {
      return; // Exit early if still loading
    }

    // Function to handle hash changes
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      const predictionNumber = parseInt(hash);

      // Validate prediction number exists in predictions object
      if (
        !isNaN(predictionNumber) &&
        predictionNumber >= 0 &&
        predictions[predictionNumber]
      ) {
        setPrediction(predictionNumber);
      } else {
        // If invalid prediction number or prediction doesn't exist, default to 1
        setPrediction(1);
        // Use history.replaceState to update URL without triggering a new history entry
        history.replaceState(null, "", "#1");
      }
    };

    // Handle initial hash on component mount or when predictions finish loading
    handleHashChange();
    // Add event listener for hash changes
    window.addEventListener("hashchange", handleHashChange);
    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [predictions, isMetaLoading]);

  // Function to update hash when prediction changes programmatically
  const updatePrediction = (newPrediction, check = true) => {
    if (predictions[newPrediction] || !check) {
      window.location.hash = newPrediction.toString();
      setPrediction(newPrediction);
    } else {
      console.warn(`Prediction ${newPrediction} does not exist`);
    }
  };

  useEffect(() => {
    const checkSupply = async () => {
      const [antiBalanceCache, proBalanceCache] = await Promise.all([
        getTokenBalance(wallet.publicKey, ANTI_TOKEN_MINT),
        getTokenBalance(wallet.publicKey, PRO_TOKEN_MINT),
      ]);
      setAntiBalanceLive(!wallet.disconnecting ? antiBalanceCache : 0);
      setProBalanceLive(!wallet.disconnecting ? proBalanceCache : 0);
    };

    if (wallet.publicKey || dataUpdated) {
      checkSupply();
    }
  }, [wallet, dataUpdated, wallet.disconnecting, wallet.publicKey]);

  useEffect(() => {
    const checkBalance = async () => {
      const _balance = await getBalance(wallet.publicKey, String(prediction));
      const balance = JSON.parse(_balance.message);
      const _withdrawal = await getWithdrawal(
        wallet.publicKey,
        String(prediction)
      );
      const withdrawal = JSON.parse(_withdrawal.message);
      setAntiBalance(
        !wallet.disconnecting
          ? antiBalanceLive - balance.anti + withdrawal.anti
          : 0
      );
      setProBalance(
        !wallet.disconnecting
          ? proBalanceLive - balance.pro + withdrawal.pro
          : 0
      );
      setAntiUsage(
        !wallet.disconnecting
          ? withdrawal.anti + withdrawal.pro > 0
            ? withdrawal.anti - balance.anti
            : balance.anti
          : 0
      );
      setProUsage(
        !wallet.disconnecting
          ? withdrawal.anti + withdrawal.pro > 0
            ? withdrawal.pro - balance.pro
            : balance.pro
          : 0
      );
      setBaryonBalance(
        !wallet.disconnecting
          ? withdrawal.baryon + withdrawal.photon > 0
            ? 0
            : balance.baryon
          : 0
      );
      setPhotonBalance(
        !wallet.disconnecting
          ? withdrawal.photon + withdrawal.baryon > 0
            ? 0
            : balance.photon
          : 0
      );
    };

    if ((wallet.publicKey || dataUpdated) && prediction >= 0) {
      checkBalance();
    }
  }, [
    wallet,
    dataUpdated,
    wallet.publicKey,
    wallet.disconnecting,
    prediction,
    antiBalanceLive,
    proBalanceLive,
  ]);

  // Create a ref to store the chart instance
  const chartRef = useRef(null);
  useEffect(() => {
    const useBinning = detectBinningStrategy([
      balances.startTime,
      balances.endTime,
    ]);
    if (useBinning) {
      if (useBinning === "hourly") {
        setPredictionHistoryTimeframe("1H");
      }
      if (useBinning === "6-hour") {
        setPredictionHistoryTimeframe("6H");
      }
      if (useBinning === "12-hour") {
        setPredictionHistoryTimeframe("12H");
      }
      if (useBinning === "daily") {
        setPredictionHistoryTimeframe("1D");
      }
      if (useBinning === "unknown") {
        setPredictionHistoryTimeframe("ALL");
      }
    }
    const getSegmentColor = (context) => {
      // Ensure we have a valid chart context
      if (!context.chart?.ctx) {
        return "rgba(128, 128, 128, 0.5)"; // Fallback color
      }

      const thisBin =
        context.p0DataIndex +
        balances.events.cumulative.timestamps.findIndex((timestamp) =>
          parseDateToISO(timestamp, useBinning)
        );
      const nextBin =
        context.p1DataIndex +
        balances.events.cumulative.timestamps.findIndex((timestamp) =>
          parseDateToISO(timestamp, useBinning)
        );
      const startValue = getPlotColor(
        balances.events.cumulative.pro,
        balances.events.cumulative.anti,
        thisBin
      );
      const endValue = getPlotColor(
        balances.events.cumulative.pro,
        balances.events.cumulative.anti,
        nextBin
      );
      const allColors = getAllPlotColor(
        balances.events.cumulative.pro,
        balances.events.cumulative.anti
      );
      const limits = [
        Math.min(...allColors),
        Math.max(...allColors) === 0 ? 50 : Math.max(...allColors),
      ];
      const currentTick = parseDateToISO(
        balances.events.cumulative.timestamps[thisBin],
        useBinning
      );
      const nextTick = parseDateToISO(
        balances.events.cumulative.timestamps[nextBin],
        useBinning
      );
      const nowTime = new Date().toISOString();
      // Past segments should be null
      if (nextTick <= balances.startTime) {
        return "rgba(128, 128, 128, 0.5)";
      }
      // Future segments should be grey
      if (currentTick > nowTime && nextTick > nowTime) {
        return "rgba(128, 128, 128, 0.5)";
      }
      // Far future segments should be null
      if (currentTick > balances.endTime) {
        return "rgba(128, 0, 0, 0.0)";
      }

      // Create gradients only when we have valid coordinates
      if (context.p0 && context.p1) {
        // Segment crossing startTime - gradient from null to color
        if (currentTick < balances.startTime && nextTick > balances.startTime) {
          const gradient = context.chart.ctx.createLinearGradient(
            context.p0.x,
            context.p0.y,
            context.p1.x,
            context.p1.y
          );
          gradient.addColorStop(0, "rgba(128, 128, 128, 0.5)");
          gradient.addColorStop(1, "rgba(3, 173, 252, 0.75)");
          return gradient;
        }
        // Segment crossing nowTime - gradient from color to grey
        if (currentTick < nowTime && nextTick > nowTime) {
          const gradient = context.chart.ctx.createLinearGradient(
            context.p0.x,
            context.p0.y,
            context.p1.x,
            context.p1.y
          );
          gradient.addColorStop(
            0,
            generateGradientColor(
              startValue,
              limits[0],
              limits[1],
              Math.max(...allColors) === 0
                ? [128, 128, 128, 0.5]
                : [66, 255, 214, 0.75],
              [3, 173, 252, 0.75]
            )
          );
          gradient.addColorStop(1, "rgba(128, 128, 128, 0.5)");
          return gradient;
        }
        // Past segments (both ticks before nowTime)
        if (currentTick < nowTime && nextTick < nowTime) {
          const gradient = context.chart.ctx.createLinearGradient(
            context.p0.x,
            context.p0.y,
            context.p1.x,
            context.p1.y
          );
          gradient.addColorStop(
            0,
            generateGradientColor(
              startValue,
              limits[0],
              limits[1],
              allColors.findIndex((value) => value !== 0) >= nextBin ||
                Math.max(...allColors) === 0
                ? [128, 128, 128, 0.5]
                : [66, 255, 214, 0.75],
              [3, 173, 252, 0.75]
            )
          );
          gradient.addColorStop(
            1,
            generateGradientColor(
              endValue,
              limits[0],
              limits[1],
              allColors.findIndex((value) => value !== 0) >= nextBin ||
                Math.max(...allColors) === 0
                ? [128, 128, 128, 0.5]
                : [66, 255, 214, 0.75],
              [3, 173, 252, 0.75]
            )
          );
          return gradient;
        }
      }

      // Fallback
      return "rgba(128, 128, 128, 0.5)";
    };

    // Prepare the chart data
    const plotable = balances.events.cumulative.timestamps
      .map((timestamp, index) => {
        const dateISO = parseDateToISO(timestamp, useBinning);
        if (dateISO) {
          const pro = balances.events.cumulative.pro[index];
          const anti = balances.events.cumulative.anti[index];
          const total = pro + anti;
          return total === 0 ? 50 : (pro / total) * 100;
        }
        return null;
      })
      .filter((value) => value !== null);
    const labels = addRepetitionMarkers(
      balances.events.cumulative.timestamps.map((value) =>
        shortenTick(value, useBinning)
      )
    );

    const chartData = {
      type: "line",
      labels: labels,
      datasets: [
        {
          label: "Yes",
          data: plotable,
          segment: {
            borderCapStyle: "round",
            borderColor: getSegmentColor,
          },
          tension: 0,
          borderWidth: isMobile ? 2 : 4,
          pointRadius: 0,
          pointHoverRadius: isMobile ? 4 : 6,
          hoverBackgroundColor: "#ffffff55",
          hoverBorderColor: "#ffffffaa",
        },
        {
          // Add a hidden dataset for the certainty tooltip
          label: "Certainty",
          data: balances.events.cumulative.timestamps
            .map((timestamp, index) => {
              const dateISO = parseDateToISO(timestamp, useBinning);
              if (dateISO) {
                const total =
                  balances.events.cumulative.photon[index] +
                  balances.events.cumulative.baryon[index];
                return total > 0
                  ? (balances.events.cumulative.photon[index] / total) * 100
                  : 50;
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
      plugins:
        labels.length > 0
          ? [verticalLinesPlugin, xAxisLabelPlugin, nowTimePlugin]
          : [],
      options: {
        layout: {
          padding: {
            top: 20,
          },
        },
        animation: {
          duration: 0,
        },
        responsive: true,
        interaction: {
          intersect: false,
          mode: "index",
        },
        plugins: {
          verticalLines:
            balances.startTime === "-" || balances.endTime === "-"
              ? {
                  markers: [],
                  labels: [],
                  useBinning: useBinning,
                  isMobile: isMobile,
                }
              : {
                  markers:
                    balances.startTime === "-" || balances.endTime === "-"
                      ? []
                      : [balances.startTime, balances.endTime],
                  labels:
                    balances.startTime === "-" || balances.endTime === "-"
                      ? []
                      : ["Start", "Close"],
                  useBinning: useBinning,
                  isMobile: isMobile,
                },
          xAxisLabel: { isMobile: isMobile },
          nowTime:
            balances.startTime === "-" || balances.endTime === "-"
              ? {
                  marker: [],
                  values: [[], []],
                  labels: [],
                  useBinning: useBinning,
                  isMobile: isMobile,
                }
              : {
                  marker:
                    balances.startTime === "-" ||
                    balances.endTime === "-" ||
                    isOver
                      ? []
                      : [
                          useBinning !== "hourly"
                            ? new Date()
                            : new Date()
                                .getUTCHours()
                                .toString()
                                .padStart(2, 0) +
                              ":" +
                              new Date()
                                .getUTCMinutes()
                                .toString()
                                .padStart(2, 0),
                        ],
                  values: [labels, plotable],
                  labels:
                    balances.startTime === "-" ||
                    balances.endTime === "-" ||
                    isOver
                      ? []
                      : findBinForTimestamp(
                          new Date().toISOString(),
                          balances.events.cumulative.timestamps.map((value) =>
                            parseDateToISO(value)
                          )
                        ) ===
                        findBinForTimestamp(
                          balances.startTime,
                          balances.events.cumulative.timestamps.map((value) =>
                            parseDateToISO(value)
                          )
                        )
                      ? []
                      : isMobile
                      ? []
                      : new Date().toISOString() > balances.endTime ||
                        new Date().toISOString() < balances.startTime
                      ? []
                      : ["Latest"],
                  useBinning: useBinning,
                  isMobile: isMobile,
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
                const allColors = getAllPlotColor(
                  balances.events.cumulative.pro,
                  balances.events.cumulative.anti
                );
                const currentTick = parseDateToISO(
                  balances.events.cumulative.timestamps.find(
                    (timestamp) =>
                      shortenTick(timestamp, useBinning) ===
                        context.chart.data.labels[context.dataIndex] ||
                      shortenTick(timestamp, useBinning) + marker ===
                        context.chart.data.labels[context.dataIndex]
                  ),
                  useBinning
                );
                const nowTime = new Date();
                if (
                  new Date(currentTick).getTime() > nowTime.getTime() ||
                  new Date(currentTick).getTime() <
                    new Date(balances.startTime).getTime() ||
                  new Date(currentTick).getTime() >
                    new Date(balances.endTime).getTime() ||
                  balances.events.cumulative.photon.findIndex(
                    (value) => value !== 0
                  ) > context.dataIndex
                ) {
                  return ` `;
                }
                return Math.max(...allColors) > 0
                  ? ` ${value.toFixed(0).padStart(2)}% ${
                      context.datasetIndex === 0 ? "expectation" : "uncertainty"
                    }`
                  : ` `;
              },
              labelColor: (context) => {
                const value = context.raw;
                const allColors = getAllPlotColor(
                  balances.events.cumulative.pro,
                  balances.events.cumulative.anti
                );
                const limits = [Math.min(...allColors), Math.max(...allColors)];
                const currentTick = parseDateToISO(
                  balances.events.cumulative.timestamps.find(
                    (timestamp) =>
                      shortenTick(timestamp, useBinning) ===
                        context.chart.data.labels[context.dataIndex] ||
                      shortenTick(timestamp, useBinning) + marker ===
                        context.chart.data.labels[context.dataIndex]
                  ),
                  useBinning
                );
                const nowTime = new Date();
                // Future segments should be grey
                if (
                  new Date(currentTick).getTime() > nowTime.getTime() ||
                  new Date(currentTick).getTime() <
                    new Date(balances.startTime).getTime() ||
                  new Date(currentTick).getTime() >
                    new Date(balances.endTime).getTime() ||
                  Math.max(...allColors) === 0
                ) {
                  return {
                    backgroundColor: "#808080",
                    borderColor: "#808080",
                  };
                }
                return {
                  backgroundColor: generateGradientColor(
                    value,
                    context.datasetIndex === 0 ? 0 : limits[0],
                    context.datasetIndex === 0 ? 100 : limits[1],
                    context.datasetIndex === 0
                      ? allColors.findIndex((value) => value !== 0) >
                        context.dataIndex
                        ? [128, 128, 128, 1]
                        : [255, 51, 0, 1]
                      : allColors.findIndex((value) => value !== 0) >
                        context.dataIndex
                      ? [128, 128, 128, 1]
                      : [66, 255, 214, 0.75],
                    context.datasetIndex === 0
                      ? allColors.findIndex((value) => value !== 0) >
                        context.dataIndex
                        ? [128, 128, 128, 1]
                        : [0, 219, 84, 1]
                      : allColors.findIndex((value) => value !== 0) >
                        context.dataIndex
                      ? [128, 128, 128, 1]
                      : [3, 173, 252, 0.75]
                  ),
                  borderColor: generateGradientColor(
                    value,
                    context.datasetIndex === 0 ? 0 : limits[0],
                    context.datasetIndex === 0 ? 100 : limits[1],
                    context.datasetIndex === 0
                      ? allColors.findIndex((value) => value !== 0) >
                        context.dataIndex
                        ? [128, 128, 128, 1]
                        : [255, 51, 0, 1]
                      : allColors.findIndex((value) => value !== 0) >
                        context.dataIndex
                      ? [128, 128, 128, 1]
                      : [66, 255, 214, 0.75],
                    context.datasetIndex === 0
                      ? allColors.findIndex((value) => value !== 0) >
                        context.dataIndex
                        ? [128, 128, 128, 1]
                        : [0, 219, 84, 1]
                      : allColors.findIndex((value) => value !== 0) >
                        context.dataIndex
                      ? [128, 128, 128, 1]
                      : [3, 173, 252, 0.75]
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
              display: true,
              color: "#d3d3d309",
            },
            ticks: {
              font: {
                family: "'SF Mono Round'",
                size: isMobile ? 10 : 12,
              },
              minRotation: 0,
              maxRotation: isMobile ? 0 : 90,
              color: "#d3d3d399",
              padding: isMobile ? 10 : 15,
              callback: function (_, index) {
                if (
                  index === 0 &&
                  useBinning !== "daily" &&
                  useBinning !== "hourly"
                ) {
                  return;
                }
                return labels[index];
              },
            },
          },
          y: {
            grid: {
              display: labels.length > 0,
              color: "rgba(255, 255, 255, 0.05)",
            },
            ticks: {
              display: labels.length > 0,
              padding: isMobile ? 5 : 15,
              callback: function (value) {
                return value === 0
                  ? "NO"
                  : value === 100
                  ? "YES"
                  : value.toFixed(0) + "%";
              },
              stepSize: function (ctx) {
                const maxValue = Math.max(
                  ...ctx.chart.data.datasets.flatMap((dataset) => dataset.data)
                );
                return maxValue * 0.1;
              },
              font: {
                family: "'SF Mono Round'",
                size: isMobile ? 10 : 12,
              },
              color: function (context) {
                const value = context.tick.value;
                return generateGradientColor(
                  value,
                  0,
                  100,
                  [255, 51, 0, 1],
                  [0, 219, 84, 1]
                );
              },
            },
            min: 0,
            max: started
              ? function (ctx) {
                  const maxValue = Math.max(
                    ...ctx.chart.data.datasets.flatMap(
                      (dataset) => dataset.data
                    )
                  );
                  return maxValue <= 50 ? 50 : 100;
                }
              : 100,
          },
          y2: {
            position: "right",
            grid: {
              display: false,
              color: "rgba(255, 255, 255, 0.1)",
            },
            ticks: {
              display: labels.length > 0,
              padding: isMobile ? 5 : 15,
              callback: function (value) {
                return value === 0
                  ? "NO"
                  : value === 100
                  ? "YES"
                  : value.toFixed(0) + "%";
              },
              stepSize: function (ctx) {
                const maxValue = Math.max(
                  ...ctx.chart.data.datasets.flatMap((dataset) => dataset.data)
                );
                return maxValue * 0.1;
              },
              font: {
                family: "'SF Mono Round'",
                size: isMobile ? 10 : 12,
              },
              color: function (context) {
                const value = context.tick.value;
                return generateGradientColor(
                  value,
                  0,
                  100,
                  [255, 51, 0, 1],
                  [0, 219, 84, 1]
                );
              },
            },
            min: 0,
            max: started
              ? function (ctx) {
                  const maxValue = Math.max(
                    ...ctx.chart.data.datasets.flatMap(
                      (dataset) => dataset.data
                    )
                  );
                  return maxValue <= 50 ? 50 : 100;
                }
              : 100,
          },
        },
      },
    };
    setPredictionHistoryChartData(chartData);
    // Force a chart update after the initial render
    const timeoutId = setTimeout(() => {
      if (chartRef.current) {
        chartRef.current.meanpdate("none"); // Update without animation
      }
    }, 0);

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
    };
  }, [balances, started, isOver]);

  return (
    <>
      <section className="min-h-screen pt-16 md:pt-20 flex flex-col items-center relative mt-10 mb-10">
        {/* Hero Section */}
        <div className="w-full max-w-7xl px-4 mb-8 bg-gray-800 border border-gray-700 text-gray-300 p-4 text-center rounded-md">
          <div className="flex items-center gap-2 flex-wrap md:flex-nowrap justify-center md:justify-start">
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-300 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
                />
              </svg>
            </div>
            <p className="text-left tracking-tight text-sm">
              The prediction program is built off-chain for demonstration
              purposes. No funds will be deducted from your wallet.
            </p>
          </div>
        </div>
        <div className={`flex flex-col items-center w-full max-w-7xl px-4`}>
          {/* Hero Image */}
          <div className="flex flex-row items-center w-full">
            <div className="flex justify-center relative w-40 mr-4 -mt-2">
              <div className="absolute w-32 h-32 rounded-full bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20 blur-[50px]"></div>
              <img
                src={`${BASE_URL}/assets/antitoken_logo_large.webp`}
                alt="Antitoken Logo"
                className={
                  isMobile
                    ? "w-24 h-24 rounded-full object-cover border-4 border-gray-800/50 relative z-10 transition-transform duration-200 ease-out"
                    : "w-32 h-32 rounded-full object-cover border-4 border-gray-800/50 relative z-10 transition-transform duration-200 ease-out"
                }
              />
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl mb-4 text-gray-300 font-bold font-outfit">
              Predict with <span className="text-accent-primary">ANTI</span> and{" "}
              <span className="text-accent-secondary">PRO</span>
            </h1>
          </div>
          <div
            className={`w-full mt-4 md:mt-4 lg:mt-8 flex flex-col lg:flex-row lg:gap-4 ${
              isMetaLoading ? "items-center" : ""
            }`}
          >
            <div className="flex flex-col w-full lg:w-2/3 lg:-mt-8">
              <div className="flex flex-row justify-between">
                {isMobile && (
                  <div className="-ml-2">
                    <TimeTicker isMobile={isMobile} />
                  </div>
                )}
                {!isMobile && <div> </div>}
                <div className="flex flex-row items-center -mr-2">
                  <button
                    className="bg-transparent text-accent-primary hover:text-gray-300 px-2 py-1 rounded-md text-sm font-normal disabled:text-gray-300 disabled:cursor-not-allowed relative group"
                    onClick={() => updatePrediction(prediction - 1)}
                  >
                    <svg
                      className="w-6 h-6 rotate-180"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 15v3c0 .5523.44772 1 1 1h9.5M3 15v-4m0 4h9m-9-4V6c0-.55228.44772-1 1-1h16c.5523 0 1 .44772 1 1v5H3Zm5 0v8m4-8v8m7.0999-1.0999L21 16m0 0-1.9001-1.9001M21 16h-5"
                      />
                    </svg>
                    <span className="cursor-pointer">
                      <span
                        className={`absolute text-xs tracking-tight p-2 bg-gray-800 rounded-md w-44 -translate-x-2/3 lg:translate-x-0 -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block`}
                      >
                        {`Previous Prediction`}
                      </span>
                    </span>
                  </button>
                  <div className="text-gray-600 text-xs">|</div>
                  <button
                    className="bg-transparent text-accent-secondary hover:text-gray-300 px-2 py-1 rounded-md text-sm font-normal disabled:text-gray-300 disabled:cursor-not-allowed relative group"
                    onClick={() => updatePrediction(prediction + 1)}
                  >
                    <svg
                      className="w-6 h-6"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 15v3c0 .5523.44772 1 1 1h9.5M3 15v-4m0 4h9m-9-4V6c0-.55228.44772-1 1-1h16c.5523 0 1 .44772 1 1v5H3Zm5 0v8m4-8v8m7.0999-1.0999L21 16m0 0-1.9001-1.9001M21 16h-5"
                      />
                    </svg>
                    <span className="cursor-pointer">
                      <span
                        className={`absolute text-xs tracking-tight p-2 bg-gray-800 rounded-md w-44 -translate-x-full lg:translate-x-0 -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block`}
                      >
                        {`Next Prediction`}
                      </span>
                    </span>
                  </button>
                </div>
              </div>
              <div className="bg-dark-card p-4 rounded-lg w-full mb-4 border border-gray-800">
                <div className="flex flex-row justify-between items-center mb-2">
                  <div className="flex flex-row items-center mb-2 w-2/3">
                    <div
                      className={`${
                        isMobile ? "text-lg" : "text-2xl"
                      } tracking-word text-gray-300 text-left font-medium`}
                    >
                      {predictions[prediction]
                        ? predictions[prediction].title
                        : ""}
                      &nbsp;
                    </div>
                    <span className="relative group">
                      <span className="cursor-pointer text-sm text-gray-400">
                        &#9432;
                        <span
                          className={`absolute ${
                            isMobile ? "text-xs" : "text-sm"
                          } tracking-tight p-2 bg-gray-800 rounded-md w-64 -translate-x-full lg:-translate-x-1/2 -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block`}
                        >
                          {predictions[prediction]
                            ? predictions[prediction].description
                            : ""}
                        </span>
                      </span>
                    </span>
                  </div>
                  <button
                    className={`bg-transparent border border-accent-primary hover:border-gray-300 text-accent-primary hover:text-gray-300 px-2 py-1 pt-2 rounded-md ${
                      isMobile ? "text-xs pt-2" : "text-sm"
                    } font-normal disabled:border-gray-300 disabled:text-gray-300 disabled:cursor-not-allowed`}
                    onClick={() => setTriggerAddPrediction(true)}
                    disabled={
                      alreadyPosted || !wallet.connected || wallet.disconnecting
                    }
                  >
                    <span className="tracking-tight">Add New</span>
                  </button>
                </div>
                <div className="flex flex-row justify-between text-xs">
                  <div className="text-[11px] text-gray-500 text-left">
                    <span className="relative group">
                      <span className="cursor-pointer">
                        &#9432;
                        <span
                          className={`absolute tracking-tight p-2 bg-gray-800 rounded-md w-64 translate-x-0 lg:translate-x-0 -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block`}
                        >
                          {`Prediction market opening date & time: ${
                            predictionConfig.startTime !== "-"
                              ? isMobile
                                ? parseToUTC(
                                    predictionConfig.startTime,
                                    isMobile
                                  ) + " UTC"
                                : parseToUTC(
                                    predictionConfig.startTime,
                                    isMobile
                                  ).split(",")[0]
                              : "..."
                          }`}
                        </span>
                      </span>
                    </span>
                    &nbsp;<span className="tracking-tight">Start</span>:{" "}
                    <span
                      className={`font-sfmono text-gray-400 text-[11px] ${
                        loading ? "animate-pulse" : ""
                      }`}
                    >
                      {predictionConfig.startTime !== "-"
                        ? isMobile
                          ? parseToUTC(
                              predictionConfig.startTime,
                              isMobile
                            ).split(",")[0]
                          : parseToUTC(predictionConfig.startTime, isMobile)
                        : "..."}
                    </span>
                    <span className="text-[4px]"> </span>
                    {predictionConfig.startTime !== "-" && !isMobile && (
                      <span className="font-sfmono text-gray-600 text-[10px]">
                        UTC
                      </span>
                    )}{" "}
                  </div>
                  <div className={`text-[11px] text-gray-500 text-right`}>
                    <span className="tracking-tight">Close</span>:{" "}
                    <span
                      className={`font-sfmono text-gray-400 text-[11px] ${
                        loading ? "animate-pulse" : ""
                      }`}
                    >
                      {predictionConfig.endTime !== "-"
                        ? isMobile
                          ? parseToUTC(
                              predictionConfig.endTime,
                              isMobile
                            ).split(",")[0]
                          : parseToUTC(predictionConfig.endTime, isMobile)
                        : "..."}
                    </span>
                    <span className="text-[4px]"> </span>
                    {predictionConfig.endTime !== "-" && !isMobile && (
                      <span className="font-sfmono text-gray-600 text-[10px]">
                        UTC
                      </span>
                    )}{" "}
                    <span className="relative group">
                      <span className="cursor-pointer">
                        &#9432;
                        <span
                          className={`absolute tracking-tight p-2 bg-gray-800 rounded-md w-64 z-10 -translate-x-[107px] lg:translate-x-[31px] -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block`}
                        >
                          {`Prediction market closing date & time: ${
                            predictionConfig.endTime !== "-"
                              ? isMobile
                                ? parseToUTC(
                                    predictionConfig.endTime,
                                    isMobile
                                  ) + " UTC"
                                : parseToUTC(
                                    predictionConfig.endTime,
                                    isMobile
                                  ).split(",")[0]
                              : "..."
                          }`}
                        </span>
                      </span>
                    </span>
                  </div>
                </div>
                <div className="flex flex-row justify-between">
                  <div className="text-[11px] text-gray-500 text-left">
                    <span className="relative group">
                      <span className="cursor-pointer">&#9432;</span>
                      <span className="absolute tracking-tight p-2 bg-gray-800 rounded-md w-64 translate-x-0 lg:translate-x-0 -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block">
                        Total amount of PRO & ANTI in the prediction pool
                      </span>
                    </span>{" "}
                    <span className="tracking-tight">Global Pool</span>:{" "}
                    <span className="font-sfmono text-accent-secondary text-[11px] text-opacity-80">
                      {formatCount(predictionConfig.proLive)}
                    </span>
                    {"/"}
                    <span className="font-sfmono text-accent-primary text-[11px] text-opacity-90">
                      {formatCount(predictionConfig.antiLive)}
                    </span>
                    {"/"}
                    <span className="font-sfmono text-gray-400 text-opacity-75">
                      {"$"}
                      <span className="font-sfmono text-gray-300 text-[11px] text-opacity-90">
                        {antiData && proData
                          ? formatCount(
                              predictionConfig.proLive *
                                Number(proData.priceUsd) +
                                predictionConfig.antiLive *
                                  Number(antiData.priceUsd)
                            )
                          : "0"}
                      </span>
                      {""}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 text-right">
                    <span className="tracking-tight">
                      {isMobile ? "Ratio" : "Token Ratio"}
                    </span>
                    {": "}
                    <span className="font-sfmono text-gray-400 text-[11px]">
                      {predictionConfig.antiLive > 0 &&
                      predictionConfig.proLive > 0
                        ? (
                            predictionConfig.proLive / predictionConfig.antiLive
                          ).toFixed(3)
                        : "0.000"}
                    </span>{" "}
                    <span className="relative group">
                      <span className="cursor-pointer">
                        &#9432;
                        <span className="absolute tracking-tight p-2 bg-gray-800 rounded-md w-64 z-10 -translate-x-[149px] lg:-translate-x-[40px] -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block">
                          Ratio PRO:ANTI in the prediction pool
                        </span>
                      </span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center px-5 py-2 backdrop-blur-sm bg-dark-card w-full border-x border-b border-t border-gray-800 rounded-t-lg">
                {predictionHistoryChartData && (
                  <div className={`flex flex-col w-full`}>
                    <div className={`flex justify-between items-center w-full`}>
                      <div className="flex flex-row">
                        <div
                          className={`flex flex-row ${
                            !isMobile ? "items-center" : "justify-between"
                          }`}
                        >
                          <div className="-mt-[1px] text-xl text-gray-300 text-left font-medium flex flex-row items-center">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                started && !isOver
                                  ? "animate-pulse bg-green-500"
                                  : "bg-gray-500"
                              }`}
                            ></div>
                            {isMobile && <div>&nbsp;&nbsp;&nbsp;</div>}
                          </div>
                          <div className={isMobile ? `pt-0` : `-mt-[2.5px]`}>
                            {!isMobile && <TimeTicker isMobile={isMobile} />}
                          </div>
                          <div
                            className={`${isMobile ? "pt-[6px]" : "pt-[6px]"}`}
                          >
                            <div className="relative group cursor-pointer">
                              <TimeCompletionPie
                                startTime={
                                  predictions[prediction]?.schedule?.[0] || ""
                                }
                                endTime={
                                  predictions[prediction]?.schedule?.[1] || ""
                                }
                                size={isMobile ? 20 : 20}
                              />
                              <span className="cursor-pointer">
                                <span
                                  className={`absolute text-xs tracking-tight p-2 bg-gray-800 rounded-md w-44 -translate-x-2/3 lg:translate-x-0 -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block`}
                                >
                                  {`Time to start: `}
                                </span>
                              </span>
                            </div>
                          </div>
                          <button
                            className={`ml-4 ${
                              resolved
                                ? "text-accent-secondary"
                                : !started
                                ? "text-gray-400"
                                : !isOver
                                ? "text-accent-primary"
                                : "text-blue-400"
                            } ${isMobile ? "pt-[5.8px]" : "mt-1"}`}
                            onClick={() => setTriggerResolution(true)}
                          >
                            <div className={`relative group cursor-pointer`}>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 32 32"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                class="lucide lucide-orbit"
                              >
                                <circle cx="12" cy="12" r="3" />
                                <circle cx="19" cy="5" r="2" />
                                <circle cx="5" cy="19" r="2" />
                                <path d="M10.4 21.9a10 10 0 0 0 9.941-15.416" />
                                <path d="M13.5 2.1a10 10 0 0 0-9.841 15.416" />
                              </svg>
                              <span className="cursor-pointer">
                                <span
                                  className={`absolute text-xs tracking-tight p-2 bg-gray-800 rounded-md w-64 -translate-x-2/3 lg:translate-x-0 -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block`}
                                >
                                  {`Resolution Status: ${
                                    resolution
                                      ? "Resolved"
                                      : !started
                                      ? "Unknown"
                                      : !isOver
                                      ? "Pending"
                                      : "Awaiting Confirmation"
                                  }`}
                                </span>
                              </span>
                            </div>
                          </button>
                        </div>
                      </div>
                      <div
                        className={`flex gap-1 mt-1 ml-auto font-sfmono ${
                          loading ? "hidden" : "ml-auto"
                        }`}
                      >
                        <div className="font-grotesk">
                          <span className="relative group">
                            <span className="cursor-pointer text-xs text-gray-500">
                              &#9432;
                            </span>
                            <span className="absolute text-xs tracking-tight p-2 bg-gray-800 rounded-md w-64 -translate-x-1/2 lg:-translate-x-1/2 -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block">
                              {`Displays the global expectation of the outcome over time`}
                            </span>
                          </span>
                        </div>
                        <div
                          className={
                            predictionHistoryTimeframe === "1H"
                              ? "timeframe-pill-active"
                              : "timeframe-pill"
                          }
                          onClick={() => {}}
                        >
                          <span className="text-xs opacity-75">
                            1<span className="text-[10px]">H</span>
                          </span>
                        </div>
                        <div
                          className={
                            predictionHistoryTimeframe === "6H"
                              ? "timeframe-pill-active"
                              : "timeframe-pill"
                          }
                          onClick={() => {}}
                        >
                          <span className="text-xs opacity-75">
                            6<span className="text-[10px]">H</span>
                          </span>
                        </div>
                        <div
                          className={
                            predictionHistoryTimeframe === "12H"
                              ? "timeframe-pill-active"
                              : "timeframe-pill"
                          }
                          onClick={() => {}}
                        >
                          <span className="text-xs opacity-75">
                            12<span className="text-[10px]">H</span>
                          </span>
                        </div>
                        <div
                          className={
                            predictionHistoryTimeframe === "1D"
                              ? "timeframe-pill-active"
                              : "timeframe-pill"
                          }
                          onClick={() => {}}
                        >
                          <span className="text-xs opacity-75">
                            1<span className="text-[10px]">D</span>
                          </span>
                        </div>
                        <div
                          className={
                            predictionHistoryTimeframe === "1W"
                              ? "timeframe-pill-active"
                              : "timeframe-pill"
                          }
                          onClick={() => {}}
                        >
                          <span className="text-xs opacity-75">
                            1<span className="text-[10px]">W</span>
                          </span>
                        </div>
                        <div
                          className={
                            predictionHistoryTimeframe === "ALL"
                              ? "timeframe-pill-active"
                              : "timeframe-pill"
                          }
                          onClick={() => {}}
                        >
                          <span className="text-xs">ALL</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-col items-center mb-8 lg:mb-4 border-b border-x border-gray-800 rounded-b-lg w-full bg-black">
                {isMetaLoading ? (
                  <BinaryOrbit
                    size={120}
                    orbitRadius={40}
                    particleRadius={15}
                    padding={20}
                    invert={false}
                  />
                ) : (
                  <Line
                    ref={chartRef}
                    data={predictionHistoryChartData}
                    options={predictionHistoryChartData.options}
                    plugins={predictionHistoryChartData.plugins}
                  />
                )}
              </div>
              <div className="mb-8 mt-0">
                <Metadata
                  type="Binary"
                  oracle="Milton AI Agent"
                  truth={
                    truth.join(",") === "0,1" && isOver
                      ? "Yes"
                      : truth.join(",") === "1,0" && isOver
                      ? "No"
                      : truth.join(",") === "0,0" && isOver
                      ? "Unresolved"
                      : formatTruth(truth)
                  }
                  tellers="ChatGPT-o1/o3-mini, Claude Sonnet 3.5, Grok 2"
                  isMobile={isMobile}
                />
              </div>
            </div>
            {showCollider ? (
              <div className={isMobile ? `w-full` : `w-1/3`}>
                <div className="flex justify-between items-center px-5 py-2 backdrop-blur-sm bg-dark-card rounded-t-lg border border-gray-800 w-full">
                  <h2 className="text-lg text-gray-300 text-left font-medium tracking-word">
                    Predict
                  </h2>
                  <button
                    className="text-sm text-accent-primary hover:text-gray-300"
                    onClick={() => {
                      setShowCollider(false),
                        setDataUpdated(false),
                        setRefresh(false);
                    }}
                  >
                    <div className="flex flex-row items-center text-accent-orange hover:text-white transition-colors">
                      <div className="mr-1 tracking-word">
                        <span className="opacity-75 text-[11px]">
                          Switch to
                        </span>{" "}
                        Claim
                      </div>
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="rotate-90 hover:rotate-180 transition-transform duration-200 ease-in-out"
                      >
                        <path
                          d="M6 2L6 14L2 10"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="square"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M10 14L10 2L14 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="square"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </button>
                </div>
                <Collider
                  prediction={prediction}
                  wallet={wallet}
                  antiBalance={antiBalance}
                  proBalance={proBalance}
                  antiUsage={antiUsage}
                  proUsage={proUsage}
                  baryonBalance={baryonBalance}
                  photonBalance={photonBalance}
                  disabled={!wallet.connected}
                  BASE_URL={BASE_URL}
                  onPredictionSubmitted={handlePredictionSubmitted}
                  clearFields={clearFields}
                  antiData={antiData}
                  proData={proData}
                  holdings={holdings}
                  inactive={!started || isOver}
                  isMetaLoading={isMetaLoading}
                />
              </div>
            ) : (
              <div className={isMobile ? `w-full` : `w-1/3`}>
                <div className="flex justify-between items-center px-5 py-2 backdrop-blur-sm bg-dark-card rounded-t-lg border border-gray-800 w-full">
                  <h2 className="text-lg text-gray-300 text-left font-medium tracking-word">
                    Claim
                  </h2>
                  <button
                    className="text-sm text-accent-primary hover:text-gray-300"
                    onClick={() => {
                      setShowCollider(true),
                        setDataUpdated(false),
                        setRefresh(false);
                    }}
                  >
                    <div className="flex flex-row items-center text-accent-orange hover:text-white transition-colors">
                      <div className="mr-1 tracking-word">
                        <span className="opacity-75 text-[11px]">
                          Switch to
                        </span>{" "}
                        Predict
                      </div>
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="rotate-90 hover:rotate-180 transition-transform duration-200 ease-in-out"
                      >
                        <path
                          d="M6 2L6 14L2 10"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="square"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M10 14L10 2L14 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="square"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </button>
                </div>
                <Inverter
                  prediction={prediction}
                  wallet={wallet}
                  antiBalance={antiBalance}
                  proBalance={proBalance}
                  antiUsage={antiUsage}
                  proUsage={proUsage}
                  baryonBalance={baryonBalance}
                  photonBalance={photonBalance}
                  disabled={!wallet.connected}
                  BASE_URL={BASE_URL}
                  onWithdrawalSubmitted={handleWithdrawalSubmitted}
                  clearFields={clearFields}
                  antiData={antiData}
                  proData={proData}
                  isMobile={isMobile}
                  holdings={holdings}
                  inactive={!isOver}
                  truth={!isOver ? [] : truth}
                  balances={balances}
                />
              </div>
            )}
          </div>
        </div>

        <div className="backdrop-blur-xl bg-dark-card/50 mt-20 p-12 rounded-2xl border border-gray-800 text-center">
          <h2 className="font-grotesk text-3xl font-bold mb-6 bg-gradient-to-r from-accent-primary from-20% to-accent-secondary to-90% bg-clip-text text-transparent">
            Ready to dive in
          </h2>
          <p className="text-xl text-gray-300 mb-8 tracking-word">
            Join the future of prediction markets
          </p>
          <button
            className="bg-accent-primary hover:opacity-90 text-gray-300 px-8 py-3 rounded-full text-lg font-semibold tracking-tight"
            onClick={() => setShowBuyTokensModal(true)}
          >
            Buy Tokens
          </button>
        </div>
      </section>
      <BuyTokenModal
        isVisible={showBuyTokensModal}
        setIsVisible={setShowBuyTokensModal}
      />
      <PredictionMetaModal
        wallet={wallet}
        isVisible={triggerAddPrediction}
        setIsVisible={setTriggerAddPrediction}
        onSubmit={handlePredictionCreation}
      />
      {/* Animation */}
      {showAnimation && (
        <div className="w-screen h-screen fixed top-0 left-0 z-50">
          <ParticleCollision
            width={0}
            height={0}
            incomingSpeed={2}
            outgoingSpeed={1}
            curve={1}
            maxLoops={2}
            inverse={!showCollider}
            isMobile={isMobile}
            metadata={
              showCollider
                ? JSON.stringify(currentPredictionData)
                : JSON.stringify(currentWithdrawalData)
            }
            onComplete={() => {
              setShowAnimation(false);
            }}
          />
        </div>
      )}
    </>
  );
};

const FAQ = () => (
  <section className="py-20">
    <h2 className="font-grotesk text-3xl font-bold text-center mb-12 bg-gradient-to-r from-accent-primary from-30% to-accent-secondary to-70% bg-clip-text text-transparent">
      FAQs
    </h2>
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Add your FAQ items here */}
    </div>
  </section>
);

const App = () => {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const endpoint = process.env.NEXT_PUBLIC_SOL_RPC;

  // Configure supported wallets
  const wallets = useMemo(
    () => [
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <Home BASE_URL={BASE_URL} />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default App;
