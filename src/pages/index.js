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
import { Stars, ParticleCollision } from "../components/CollisionAnimation";
import Navbar from "../components/TopNavbar";
import Footer from "../components/BottomFooter";
import TimeCompletionPie from "../components/TimePie";
import BuyTokenModal from "../components/BuyTokenModal";
import PollMetaModal from "../components/PollMetaModal";
import BinaryOrbit from "../components/BinaryOrbit";
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
  emptyBags,
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
  pollsInit,
  getPlotColor,
  getAllPlotColor,
  addRepetitionMarkers,
} from "../utils/utils";
import {
  getBalance,
  getBalances,
  getPolls,
  addPoll,
  checkPosted,
} from "../utils/api";
import { decompressMetadata } from "../utils/compress";
import "@solana/wallet-adapter-react-ui/styles.css";

/* Main Page */

const Home = ({ BASE_URL }) => {
  const [trigger, setTrigger] = useState(null); // Shared state
  const [metadata, setMetadata] = useState({
    description: "Vote with $ANTI and $PRO tokens",
    ogDescription: "Vote with $ANTI and $PRO tokens",
    twitterDescription: "Vote with $ANTI and $PRO tokens",
  });

  return (
    <>
      <Head>
        <title>Antitoken | Poll</title>
        <meta name="description" content={metadata.description} />

        {/* Open Graph Meta Tags */}
        <meta property="og:title" content="Antitoken Polling Station" />
        <meta property="og:description" content={metadata.ogDescription} />
        <meta
          property="og:image"
          content={`${BASE_URL}/assets/antitoken_logo.jpeg`}
        />
        <meta property="og:url" content={`${BASE_URL}`} />
        <meta property="og:site_name" content="Antitoken" />

        {/* Twitter Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Antitoken Predicting Station" />
        <meta
          name="twitter:description"
          content={metadata.twitterDescription}
        />
        <meta
          name="twitter:image"
          content={`${BASE_URL}/assets/antitoken_logo_large.webp`}
        />
        <meta name="twitter:site" content="@antitokens" />
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
  const [poll, setPoll] = useState(1);
  const [hasPosted, setHasPosted] = useState(false);
  const [newPollPosted, setNewPollPosted] = useState(false);
  const [polls, setPolls] = useState(pollsInit);
  const [started, setStarted] = useState(false);
  const [isOver, setIsOver] = useState(false);
  const [antiBalance, setAntiBalance] = useState(0);
  const [proBalance, setProBalance] = useState(0);
  const [antiBalanceLive, setAntiBalanceLive] = useState(0);
  const [proBalanceLive, setProBalanceLive] = useState(0);
  const [antiUsage, setAntiUsage] = useState(0);
  const [proUsage, setProUsage] = useState(0);
  const [bags, setBags] = useState(emptyBags);
  const [showCollider, setShowCollider] = useState(true);
  const [dataUpdated, setDataUpdated] = useState(false);
  const [clearFields, setClearFields] = useState(false);
  const [antiData, setAntiData] = useState(defaultToken);
  const [proData, setProData] = useState(defaultToken);
  const [showAnimation, setShowAnimation] = useState(false);
  const [currentPredictionData, setCurrentPredictionData] =
    useState(emptyMetadata);
  const [balances, setBalances] = useState(metadataInit);
  const [predictionConfig, setPredictionConfig] = useState(emptyConfig);
  const [isMetaLoading, setIsMetaLoading] = useState(true);
  const [metaError, setMetaError] = useState(null);
  const [refresh, setRefresh] = useState(true);
  const [loading, setLoading] = useState(isMetaLoading);
  const [triggerAddPoll, setTriggerAddPoll] = useState(false);
  const isMobile = useIsMobile();
  const [predictionHistoryChartData, setPredictionHistoryChartData] =
    useState(null);
  const [predictionHistoryTimeframe, setPredictionHistoryTimeframe] =
    useState("1D");

  useEffect(() => {
    const fetchBalances = async () => {
      const blobPolls = await getPolls();
      const dataPolls = JSON.parse(blobPolls.message);
      const addPolls =
        JSON.stringify(dataPolls) === "{}" ? pollsInit : dataPolls;
      return addPolls;
    };

    // Wait for the Promise to resolve before setting the state
    fetchBalances()
      .then((result) => {
        setPolls(result);
        if (newPollPosted) setPoll(result.length);
      })
      .catch((error) => {
        console.error("Error fetching polls:", error);
        setPolls(pollsInit);
      });
  }, [refresh, newPollPosted]);

  useEffect(() => {
    // Update metadata based on some condition or data
    setMetadata({
      description: polls[poll]?.title || "",
      ogDescription: polls[poll]?.title || "",
      twitterDescription: polls[poll]?.title || "",
    });
  }, [poll, polls]);

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

  const handlePollCreation = async (formData) => {
    try {
      setTriggerAddPoll(false);
      const blobNewPoll = await addPoll(
        wallet.publicKey,
        formData,
        polls.length + 1
      );
      if (blobNewPoll.status === 202) {
        toast.error(blobNewPoll.message);
        return;
      }
      // Update polls state with new poll
      const updatedPolls = { ...polls };
      updatedPolls[Object.keys(polls).length + 1] = formData;
      setNewPollPosted(true);
      setPolls(updatedPolls);
      updatePoll(Object.keys(updatedPolls).length, false);
      // Force refresh of balances data
      setRefresh(true);
      // Set hasPosted to prevent multiple submissions
      setHasPosted(true);
      toast.success(blobNewPoll.message);
    } catch (error) {
      console.error("Error creating poll:", error);
      toast.error("Failed to create poll");
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
    if (polls[poll]?.schedule) {
      setStarted(new Date() > new Date(polls[poll].schedule[0]));
      setIsOver(new Date() > new Date(polls[poll].schedule[1]));
    }
  }, [polls, poll]);

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        // Always set loading when fetching new data
        setIsMetaLoading(true);

        // Fetch balances for the current poll
        const blobBalance = await getBalances(String(poll));
        const dataBalance = decompressMetadata(JSON.parse(blobBalance.message));

        // Only check for wallet permissions if wallet is connected
        if (wallet.publicKey) {
          const blobCheck = await checkPosted(wallet.publicKey);
          const dataCheck = blobCheck.message;
          setHasPosted(dataCheck === "NOT_ALLOWED");
        } else {
          setHasPosted(false); // Reset posting status when wallet disconnects
        }

        // Always update balances data, regardless of wallet status
        setBalances({
          startTime: dataBalance.startTime,
          endTime: dataBalance.endTime,
          colliderDistribution: {},
          totalDistribution: {},
          emissionsData: dataBalance.emissionsData,
          collisionsData: dataBalance.collisionsData,
          eventsOverTime: dataBalance.eventsOverTime,
        });

        setBags({
          baryon: dataBalance.totalDistribution.bags.baryon,
          photon: dataBalance.totalDistribution.bags.photon,
          baryonPool: dataBalance.emissionsData.baryonTokens,
          photonPool: dataBalance.emissionsData.photonTokens,
          anti: dataBalance.totalDistribution.bags.anti,
          pro: dataBalance.totalDistribution.bags.pro,
          antiPool: dataBalance.collisionsData.antiTokens,
          proPool: dataBalance.collisionsData.proTokens,
          wallets: dataBalance.totalDistribution.wallets,
        });
      } catch (err) {
        console.error("Error fetching metadata:", err);
        setMetaError(err);
      } finally {
        setIsMetaLoading(false);
        setRefresh(false);
      }
    };

    // Fetch whenever poll changes or refresh is triggered
    if (poll >= 0 && String(poll) === window.location.hash.slice(1)) {
      fetchBalances();
    }
  }, [poll, refresh, wallet.publicKey]); // Include wallet.publicKey to handle connection changes

  useEffect(() => {
    setPredictionConfig({
      startTime: polls[poll]?.schedule?.[0] || "-",
      endTime: polls[poll]?.schedule?.[1] || "-",
      antiLive: balances.collisionsData.antiTokens || 0,
      proLive: balances.collisionsData.proTokens || 0,
      convertToLocaleTime,
    });
  }, [balances, polls, poll]);

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
    // Only handle URL hash after polls are loaded
    if (isMetaLoading) {
      return; // Exit early if still loading
    }

    // Function to handle hash changes
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      const pollNumber = parseInt(hash);

      // Validate poll number exists in polls object
      if (!isNaN(pollNumber) && pollNumber >= 0 && polls[pollNumber]) {
        setPoll(pollNumber);
      } else {
        // If invalid poll number or poll doesn't exist, default to 1
        setPoll(1);
        // Use history.replaceState to update URL without triggering a new history entry
        history.replaceState(null, "", "#1");
      }
    };

    // Handle initial hash on component mount or when polls finish loading
    handleHashChange();
    // Add event listener for hash changes
    window.addEventListener("hashchange", handleHashChange);
    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [polls, isMetaLoading]); // Dependencies remain the same

  // Function to update hash when poll changes programmatically
  const updatePoll = (newPoll, check = true) => {
    if (polls[newPoll] || !check) {
      window.location.hash = newPoll.toString();
      setPoll(newPoll);
    } else {
      console.warn(`Poll ${newPoll} does not exist`);
    }
  };

  useEffect(() => {
    const checkSupply = async () => {
      const [antiBalanceResult, proBalanceResult] = await Promise.all([
        getTokenBalance(wallet.publicKey, ANTI_TOKEN_MINT),
        getTokenBalance(wallet.publicKey, PRO_TOKEN_MINT),
      ]);
      setAntiBalanceLive(!wallet.disconnecting ? antiBalanceResult : 0);
      setProBalanceLive(!wallet.disconnecting ? proBalanceResult : 0);
    };

    if (wallet.publicKey || dataUpdated) {
      checkSupply();
    }
  }, [wallet, dataUpdated, wallet.disconnecting, wallet.publicKey]);

  useEffect(() => {
    const checkBalance = async () => {
      const _balance = await getBalance(wallet.publicKey, String(poll));
      const balance = JSON.parse(_balance.message);
      setAntiBalance(
        !wallet.disconnecting ? antiBalanceLive - balance.anti : 0
      );
      setProBalance(!wallet.disconnecting ? proBalanceLive - balance.pro : 0);
      setAntiUsage(!wallet.disconnecting ? balance.anti : 0);
      setProUsage(!wallet.disconnecting ? balance.pro : 0);
    };

    if ((wallet.publicKey || dataUpdated) && poll >= 0) {
      checkBalance();
    }
  }, [
    wallet,
    dataUpdated,
    wallet.publicKey,
    wallet.disconnecting,
    poll,
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
        balances.eventsOverTime.cumulative.timestamps.findIndex((timestamp) =>
          parseDateToISO(timestamp, useBinning)
        );
      const nextBin =
        context.p1DataIndex +
        balances.eventsOverTime.cumulative.timestamps.findIndex((timestamp) =>
          parseDateToISO(timestamp, useBinning)
        );
      const startValue = getPlotColor(
        balances.eventsOverTime.cumulative.pro,
        balances.eventsOverTime.cumulative.anti,
        thisBin
      );
      const endValue = getPlotColor(
        balances.eventsOverTime.cumulative.pro,
        balances.eventsOverTime.cumulative.anti,
        nextBin
      );
      const allColors = getAllPlotColor(
        balances.eventsOverTime.cumulative.pro,
        balances.eventsOverTime.cumulative.anti
      );
      const limits = [
        Math.min(...allColors),
        Math.max(...allColors) === 0 ? 50 : Math.max(...allColors),
      ];
      const currentTick = parseDateToISO(
        balances.eventsOverTime.cumulative.timestamps[thisBin],
        useBinning
      );
      const nextTick = parseDateToISO(
        balances.eventsOverTime.cumulative.timestamps[nextBin],
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
    const plotable = balances.eventsOverTime.cumulative.timestamps
      .map((timestamp, index) => {
        const dateISO = parseDateToISO(timestamp, useBinning);
        if (dateISO) {
          const pro = balances.eventsOverTime.cumulative.pro[index];
          const anti = balances.eventsOverTime.cumulative.anti[index];
          const total = pro + anti;
          return total === 0 ? 50 : (pro / total) * 100;
        }
        return null;
      })
      .filter((value) => value !== null);
    const labels = addRepetitionMarkers(
      balances.eventsOverTime.cumulative.timestamps.map((value) =>
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
                          balances.eventsOverTime.cumulative.timestamps.map(
                            (value) => parseDateToISO(value)
                          )
                        ) ===
                        findBinForTimestamp(
                          balances.startTime,
                          balances.eventsOverTime.cumulative.timestamps.map(
                            (value) => parseDateToISO(value)
                          )
                        )
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
                  balances.eventsOverTime.cumulative.pro,
                  balances.eventsOverTime.cumulative.anti
                );
                const currentTick = parseDateToISO(
                  balances.eventsOverTime.cumulative.timestamps.find(
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
                  balances.eventsOverTime.cumulative.pro.findIndex(
                    (value) => value !== 0
                  ) > context.dataIndex ||
                  labels[context.dataIndex].endsWith(marker)
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
                  balances.eventsOverTime.cumulative.pro,
                  balances.eventsOverTime.cumulative.anti
                );
                const limits = [Math.min(...allColors), Math.max(...allColors)];
                const currentTick = parseDateToISO(
                  balances.eventsOverTime.cumulative.timestamps.find(
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
              maxRotation: 90,
              color: "#d3d3d399",
              padding: isMobile ? 10 : 15,
              callback: function (value, index) {
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
        chartRef.current.update("none"); // Update without animation
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
            <p className="text-left">
              The voting program is entirely off-chain. No funds will be
              deducted from your wallet.
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
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-800/50 relative z-10 transition-transform duration-200 ease-out"
              />
            </div>
            <div className="text-3xl md:text-4xl lg:text-5xl mb-4 text-gray-300 font-bold font-outfit">
              Vote with <span className="text-accent-primary">$ANTI</span> and{" "}
              <span className="text-accent-secondary">$PRO</span>
            </div>
          </div>
          <div
            className={`w-full mt-4 md:mt-4 lg:mt-8 flex flex-col lg:flex-row lg:gap-4 ${
              isMetaLoading ? "items-center" : ""
            }`}
          >
            <div className="flex flex-col w-full lg:w-3/4">
              <div className="flex flex-row justify-between">
                {isMobile && (
                  <div className="-ml-2">
                    <TimeTicker
                      fontSize={isMobile ? 12 : 12}
                      isMobile={isMobile}
                    />
                  </div>
                )}
                {!isMobile && <div> </div>}
                <div className="flex flex-row items-center -mr-2">
                  <button
                    className="bg-transparent text-accent-primary hover:text-gray-300 px-2 py-1 rounded-md text-sm font-normal disabled:text-gray-300 disabled:cursor-not-allowed relative group"
                    onClick={() => updatePoll(poll - 1)}
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
                        className={`absolute text-sm p-2 bg-gray-800 rounded-md w-32 -translate-x-3/4 lg:translate-x-0 -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block`}
                      >
                        {`Previous Poll`}
                      </span>
                    </span>
                  </button>
                  <div className="text-gray-600 text-xs">|</div>
                  <button
                    className="bg-transparent text-accent-secondary hover:text-gray-300 px-2 py-1 rounded-md text-sm font-normal disabled:text-gray-300 disabled:cursor-not-allowed relative group"
                    onClick={() => updatePoll(poll + 1)}
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
                        className={`absolute text-sm p-2 bg-gray-800 rounded-md w-32 -translate-x-full lg:translate-x-0 -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block`}
                      >
                        {`Next Poll`}
                      </span>
                    </span>
                  </button>
                </div>
              </div>
              <div className="bg-dark-card p-4 rounded-lg w-full mb-4 border border-gray-800">
                <div className="flex flex-row justify-between items-center mb-2">
                  <div className="flex flex-row items-center mb-2 w-3/4">
                    <div className="text-2xl text-gray-300 text-left font-medium">
                      {polls[poll] ? polls[poll].title : ""}&nbsp;
                    </div>
                    <span className="relative group">
                      <span className="cursor-pointer text-sm text-gray-400">
                        &#9432;
                        <span className="absolute text-sm p-2 bg-gray-800 rounded-md min-w-64 max-w-auto -translate-x-full lg:-translate-x-1/2 -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block">
                          {polls[poll] ? polls[poll].description : ""}
                        </span>
                      </span>
                    </span>
                  </div>
                  <button
                    className="bg-transparent border border-accent-primary hover:border-gray-300 text-accent-primary hover:text-gray-300 px-2 py-1 rounded-md text-sm font-normal disabled:border-gray-300 disabled:text-gray-300 disabled:cursor-not-allowed"
                    onClick={() => setTriggerAddPoll(true)}
                    disabled={
                      hasPosted || !wallet.connected || wallet.disconnecting
                    }
                  >
                    Add Poll
                  </button>
                </div>
                <div className="flex flex-row justify-between">
                  <div className="text-[12px] text-gray-500 text-left">
                    <span className="relative group">
                      <span className="cursor-pointer">
                        &#9432;
                        <span
                          className={`absolute text-sm p-2 bg-gray-800 rounded-md w-64 translate-x-0 lg:translate-x-0 -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block`}
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
                    </span>{" "}
                    &nbsp;Start:{" "}
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
                    {predictionConfig.startTime !== "-" && !isMobile && (
                      <span className="font-sfmono text-gray-600 text-[10px]">
                        &nbsp;UTC
                      </span>
                    )}{" "}
                  </div>
                  <div className={`text-[12px] text-gray-500 text-right`}>
                    Close:{" "}
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
                    {predictionConfig.endTime !== "-" && !isMobile && (
                      <span className="font-sfmono text-gray-600 text-[10px]">
                        &nbsp;UTC
                      </span>
                    )}{" "}
                    &nbsp;
                    <span className="relative group">
                      <span className="cursor-pointer">
                        &#9432;
                        <span
                          className={`absolute text-sm p-2 bg-gray-800 rounded-md w-64 z-10 -translate-x-[113px] lg:translate-x-0 -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block`}
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
                  <div className="text-[12px] text-gray-500 text-left">
                    <span className="relative group">
                      <span className="cursor-pointer">&#9432;</span>
                      <span className="absolute text-sm p-2 bg-gray-800 rounded-md w-64 translate-x-0 lg:translate-x-0 -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block">
                        Total amount of PRO & ANTI in the prediction pool
                      </span>
                    </span>{" "}
                    &nbsp;Global Pool:{" "}
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
                  <div className="text-[12px] text-gray-500 text-right">
                    {isMobile ? "Ratio:" : "Token Ratio:"}{" "}
                    <span className="font-sfmono text-gray-400 text-[11px]">
                      {predictionConfig.antiLive > 0 &&
                      predictionConfig.proLive > 0
                        ? (
                            predictionConfig.proLive / predictionConfig.antiLive
                          ).toFixed(3)
                        : "0.000"}
                    </span>{" "}
                    &nbsp;
                    <span className="relative group">
                      <span className="cursor-pointer">
                        &#9432;
                        <span className="absolute text-sm p-2 bg-gray-800 rounded-md w-64 z-10 -translate-x-[149px] lg:-translate-x-[40px] -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block">
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
                            {!isMobile && (
                              <TimeTicker
                                fontSize={isMobile ? 12 : 12}
                                isMobile={isMobile}
                              />
                            )}
                          </div>
                          <div className={isMobile ? `pt-1` : `pt-[4px]`}>
                            <TimeCompletionPie
                              startTime={polls[poll]?.schedule?.[0] || ""}
                              endTime={polls[poll]?.schedule?.[1] || ""}
                              size={isMobile ? 20 : 20}
                            />
                          </div>
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
                            <span className="absolute text-sm p-2 bg-gray-800 rounded-md w-64 -translate-x-1/2 lg:-translate-x-1/2 -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block">
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
                            predictionHistoryTimeframe === "12H"
                              ? "timeframe-pill-active"
                              : "timeframe-pill"
                          }
                          onClick={() => {}}
                        >
                          <span className="text-xs opacity-75">12H</span>
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
            </div>
            {showCollider && (
              <div className="mt-8">
                <div className="flex justify-between items-center px-5 py-2 backdrop-blur-sm bg-dark-card rounded-t-lg border border-gray-800">
                  <h2 className="text-xl text-gray-300 text-left font-medium">
                    Vote
                  </h2>
                </div>
                <Collider
                  poll={poll}
                  wallet={wallet}
                  antiBalance={antiBalance}
                  proBalance={proBalance}
                  antiUsage={antiUsage}
                  proUsage={proUsage}
                  disabled={!wallet.connected}
                  BASE_URL={BASE_URL}
                  onPredictionSubmitted={handlePredictionSubmitted}
                  clearFields={clearFields}
                  antiData={antiData}
                  proData={proData}
                  isMobile={isMobile}
                  bags={bags}
                  inactive={!started || isOver}
                  isMetaLoading={isMetaLoading}
                />
              </div>
            )}
          </div>
        </div>

        <div className="backdrop-blur-xl bg-dark-card/50 mt-20 p-12 rounded-2xl border border-gray-800 text-center">
          <h2 className="font-grotesk text-3xl font-bold mb-6 bg-gradient-to-r from-accent-primary from-20% to-accent-secondary to-90% bg-clip-text text-transparent">
            Ready to dive in?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join the future of prediction markets
          </p>
          <button
            className="bg-accent-primary hover:opacity-90 text-gray-300 px-8 py-3 rounded-full text-lg font-semibold"
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
      <PollMetaModal
        wallet={wallet}
        isVisible={triggerAddPoll}
        setIsVisible={setTriggerAddPoll}
        onSubmit={handlePollCreation}
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
            metadata={JSON.stringify(currentPredictionData)}
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
