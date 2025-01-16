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
import { Stars, ParticleCollision } from "../components/CollisionAnimation";
import {
  calculateEqualisation,
  implementEqualisation,
} from "../utils/equaliserAlpha";
import Metadata from "../components/Metadata";
import Navbar from "../components/TopNavbar";
import Footer from "../components/BottomFooter";
import BuyTokenModal from "../components/BuyTokenModal";
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
  emptyGaussian,
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
} from "../utils/utils";
import { getBalance, getBalances, getClaim, getClaims } from "../utils/api";
import { calculateCollision } from "../utils/colliderAlpha";
import "@solana/wallet-adapter-react-ui/styles.css";

/* Main Page */

const Home = ({ BASE_URL }) => {
  const [trigger, setTrigger] = useState(null); // Shared state

  return (
    <>
      <Head>
        <title>Antitoken | Predict</title>
        <meta
          name="description"
          content="Experience the future of prediction markets with $ANTI and $PRO tokens."
        />

        {/* Open Graph Meta Tags */}
        <meta property="og:title" content="Antitoken Predicting Station" />
        <meta
          property="og:description"
          content="Experience the future of prediction markets with $ANTI and $PRO tokens."
        />
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
          content="Experience the future of prediction markets with $ANTI and $PRO tokens."
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
        <LandingPage BASE_URL={BASE_URL} setTrigger={setTrigger} />
        <Footer />
      </div>
    </>
  );
};

const LandingPage = ({ BASE_URL, setTrigger }) => {
  const wallet = useWallet();
  const [showBuyTokensModal, setShowBuyTokensModal] = useState(false);
  const [started, setStarted] = useState(false);
  const [isOver, setIsOver] = useState(false);
  const [antiBalance, setAntiBalance] = useState(0);
  const [proBalance, setProBalance] = useState(0);
  const [antiUsage, setAntiUsage] = useState(0);
  const [proUsage, setProUsage] = useState(0);
  const [baryonBalance, setBaryonBalance] = useState(0);
  const [photonBalance, setPhotonBalance] = useState(0);
  const [bags, setBags] = useState(emptyBags);
  const [showCollider, setShowCollider] = useState(true);
  const [dataUpdated, setDataUpdated] = useState(false);
  const [clearFields, setClearFields] = useState(false);
  const [antiData, setAntiData] = useState(defaultToken);
  const [proData, setProData] = useState(defaultToken);
  const [showAnimation, setShowAnimation] = useState(false);
  const [currentPredictionData, setCurrentPredictionData] =
    useState(emptyMetadata);
  const [currentClaimData, setCurrentClaimData] = useState(emptyMetadata);
  const [balances, setBalances] = useState(metadataInit);
  const [claims, setClaims] = useState(metadataInit);
  const [predictionConfig, setPredictionConfig] = useState(emptyConfig);
  const [isMetaLoading, setIsMetaLoading] = useState(true);
  const [metaError, setMetaError] = useState(null);
  const [refresh, setRefresh] = useState(true);
  const [loading, setLoading] = useState(isMetaLoading);
  const [, setDynamicsCurrent] = useState([]);
  const [, setDynamicsFinal] = useState([]);
  const [truth, setTruth] = useState([0, 1]); // ANTI-PRO
  const isMobile = useIsMobile();
  const [predictionHistoryChartData, setPredictionHistoryChartData] =
    useState(null);
  const [predictionHistoryTimeframe, setPredictionHistoryTimeframe] =
    useState("1D");

  useEffect(() => {
    setLoading(isMetaLoading);
  }, [isMetaLoading]);

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
          if (label === dateStr) acc.push(i);
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

  const handleClaimSubmitted = (state, claim) => {
    if (state) {
      setCurrentClaimData(claim);
      setRefresh(true);
    } else {
      // Handle error case
      console.error("Reclaim submission failed:", claim.error);
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
    if (balances !== metadataInit) {
      setStarted(new Date() < new Date(balances.startTime));
      setIsOver(new Date() > new Date(balances.endTime));
    }
  }, [balances]);

  useEffect(() => {
    if (refresh && !started && !wallet.disconnecting) {
      const fetchBalancesWithClaims = async () => {
        try {
          setRefresh(false);
          setIsMetaLoading(true);
          const blobBalance = await getBalances();
          const blobClaim = await getClaims();
          const dataBalance = JSON.parse(blobBalance.message);
          const dataClaim = JSON.parse(blobClaim.message);

          const colliderDistribution =
            baryonBalance >= 0 || photonBalance >= 0
              ? calculateCollision(baryonBalance, photonBalance, true)
              : emptyGaussian;

          const totalDistribution =
            dataBalance.totalDistribution.u >= 0 &&
            dataBalance.totalDistribution.s >= 0
              ? calculateCollision(
                  dataBalance.emissionsData.baryonTokens,
                  dataBalance.emissionsData.photonTokens,
                  true
                )
              : emptyGaussian;

          setBalances({
            startTime: dataBalance.startTime,
            endTime: dataBalance.endTime,
            colliderDistribution: colliderDistribution,
            totalDistribution: totalDistribution,
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

          const thisAntiUsage = wallet.publicKey
            ? dataBalance.totalDistribution.bags.anti[
                dataBalance.totalDistribution.wallets.indexOf(
                  wallet.publicKey.toString()
                )
              ]
            : 0;
          const thisProUsage = wallet.publicKey
            ? dataBalance.totalDistribution.bags.pro[
                dataBalance.totalDistribution.wallets.indexOf(
                  wallet.publicKey.toString()
                )
              ]
            : 0;

          const rewardCurrent = calculateEqualisation(
            dataBalance.totalDistribution.bags.baryon,
            dataBalance.totalDistribution.bags.photon,
            dataBalance.totalDistribution.bags.anti,
            dataBalance.totalDistribution.bags.pro,
            dataBalance.collisionsData.antiTokens,
            dataBalance.collisionsData.proTokens,
            antiData && proData
              ? [Number(antiData.priceUsd), Number(proData.priceUsd)]
              : [1, 1],
            dataBalance.totalDistribution.wallets,
            [
              thisAntiUsage > thisProUsage ? 1 : 0,
              thisAntiUsage < thisProUsage ? 1 : 0,
            ]
          );

          const rewardFinal = implementEqualisation(
            dataBalance.totalDistribution.bags.baryon,
            dataBalance.totalDistribution.bags.photon,
            dataBalance.totalDistribution.bags.anti,
            dataBalance.totalDistribution.bags.pro,
            dataBalance.collisionsData.antiTokens,
            dataBalance.collisionsData.proTokens,
            antiData && proData
              ? [Number(antiData.priceUsd), Number(proData.priceUsd)]
              : [1, 1],
            dataBalance.totalDistribution.wallets,
            truth
          );

          setDynamicsCurrent(rewardCurrent ? rewardCurrent.normalised : []);
          setDynamicsFinal(rewardFinal ? rewardFinal.normalised : []);

          setClaims({
            startTime: dataClaim.startTime,
            endTime: dataClaim.endTime,
            colliderDistribution: colliderDistribution,
            totalDistribution: totalDistribution,
            emissionsData: dataClaim.emissionsData,
            collisionsData: dataClaim.collisionsData,
            eventsOverTime: dataClaim.eventsOverTime,
          });
        } catch (err) {
          console.error("Error fetching metadata:", err);
          setMetaError(err);
        } finally {
          setIsMetaLoading(false);
          setRefresh(false);
        }
      };
      fetchBalancesWithClaims();
    }
    if (wallet.disconnecting) {
      setDynamicsCurrent([]);
      setDynamicsFinal([]);
    }
  }, [
    refresh,
    baryonBalance,
    photonBalance,
    antiData,
    proData,
    started,
    truth,
    wallet,
    wallet.disconnecting,
    wallet.connected,
  ]);

  useEffect(() => {
    setPredictionConfig({
      startTime: balances.startTime || "-",
      endTime: balances.endTime || "-",
      antiLive:
        balances.collisionsData.antiTokens - claims.collisionsData.antiTokens ||
        0,
      proLive:
        balances.collisionsData.proTokens - claims.collisionsData.proTokens ||
        0,
      convertToLocaleTime,
    });
  }, [balances, claims]);

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
    const checkBalance = async () => {
      const [antiBalanceResult, proBalanceResult] = await Promise.all([
        getTokenBalance(wallet.publicKey, ANTI_TOKEN_MINT),
        getTokenBalance(wallet.publicKey, PRO_TOKEN_MINT),
      ]);
      const _balance = await getBalance(wallet.publicKey);
      const balance = JSON.parse(_balance.message);
      const _claim = await getClaim(wallet.publicKey);
      const claim = JSON.parse(_claim.message);
      setAntiBalance(
        !wallet.disconnecting
          ? antiBalanceResult - balance.anti + claim.anti
          : 0
      );
      setProBalance(
        !wallet.disconnecting ? proBalanceResult - balance.pro + claim.pro : 0
      );
      setAntiUsage(
        !wallet.disconnecting
          ? claim.anti + claim.pro > 0
            ? claim.anti - balance.anti
            : balance.anti
          : 0
      );
      setProUsage(
        !wallet.disconnecting
          ? claim.anti + claim.pro > 0
            ? claim.pro - balance.pro
            : balance.pro
          : 0
      );

      setBaryonBalance(
        !wallet.disconnecting
          ? claim.baryon + claim.photon > 0
            ? 0
            : balance.baryon
          : 0
      );
      setPhotonBalance(
        !wallet.disconnecting
          ? claim.photon + claim.baryon > 0
            ? 0
            : balance.photon
          : 0
      );
    };

    if (wallet.publicKey || dataUpdated) {
      checkBalance();
      setRefresh(true);
    }
  }, [wallet, dataUpdated, wallet.disconnecting]);

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
      const startValue = balances.eventsOverTime.cumulative.photon[thisBin];
      const endValue = balances.eventsOverTime.cumulative.photon[nextBin];
      const limits = [
        Math.min(...balances.eventsOverTime.cumulative.photon),
        Math.max(...balances.eventsOverTime.cumulative.photon) === 0
          ? 50
          : Math.max(...balances.eventsOverTime.cumulative.photon),
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
              Math.max(...balances.eventsOverTime.cumulative.photon) === 0
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
              balances.eventsOverTime.cumulative.photon.findIndex(
                (value) => value !== 0
              ) >= nextBin ||
                Math.max(...balances.eventsOverTime.cumulative.photon) === 0
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
              balances.eventsOverTime.cumulative.photon.findIndex(
                (value) => value !== 0
              ) >= nextBin ||
                Math.max(...balances.eventsOverTime.cumulative.photon) === 0
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
    const labels = balances.eventsOverTime.cumulative.timestamps.map((value) =>
      shortenTick(value, useBinning)
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
          data: balances.eventsOverTime.cumulative.timestamps
            .map((timestamp, index) => {
              const dateISO = parseDateToISO(timestamp, useBinning);
              if (dateISO) {
                const total =
                  balances.eventsOverTime.cumulative.photon[index] +
                  balances.eventsOverTime.cumulative.baryon[index];
                return total > 0
                  ? (balances.eventsOverTime.cumulative.photon[index] / total) *
                      100
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
      plugins: [verticalLinesPlugin, xAxisLabelPlugin, nowTimePlugin],
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
                    balances.startTime === "-" || balances.endTime === "-"
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
                    balances.startTime === "-" || balances.endTime === "-"
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
                const currentTick = parseDateToISO(
                  balances.eventsOverTime.cumulative.timestamps.find(
                    (timestamp) =>
                      shortenTick(timestamp, useBinning) ===
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
                  balances.eventsOverTime.cumulative.photon.findIndex(
                    (value) => value !== 0
                  ) > context.dataIndex
                ) {
                  return ` `;
                }
                return Math.max(...balances.eventsOverTime.cumulative.photon) >
                  0
                  ? ` ${value.toFixed(0).padStart(2)}% ${
                      context.datasetIndex === 0 ? "expectation" : "uncertainty"
                    }`
                  : ` `;
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
                      shortenTick(timestamp, useBinning) ===
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
                  Math.max(...balances.eventsOverTime.cumulative.photon) === 0
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
                      ? balances.eventsOverTime.cumulative.photon.findIndex(
                          (value) => value !== 0
                        ) > context.dataIndex
                        ? [128, 128, 128, 1]
                        : [255, 51, 0, 1]
                      : balances.eventsOverTime.cumulative.photon.findIndex(
                          (value) => value !== 0
                        ) > context.dataIndex
                      ? [128, 128, 128, 1]
                      : [66, 255, 214, 0.75],
                    context.datasetIndex === 0
                      ? balances.eventsOverTime.cumulative.photon.findIndex(
                          (value) => value !== 0
                        ) > context.dataIndex
                        ? [128, 128, 128, 1]
                        : [0, 219, 84, 1]
                      : balances.eventsOverTime.cumulative.photon.findIndex(
                          (value) => value !== 0
                        ) > context.dataIndex
                      ? [128, 128, 128, 1]
                      : [3, 173, 252, 0.75]
                  ),
                  borderColor: generateGradientColor(
                    value,
                    context.datasetIndex === 0 ? 0 : limits[0],
                    context.datasetIndex === 0 ? 100 : limits[1],
                    context.datasetIndex === 0
                      ? balances.eventsOverTime.cumulative.photon.findIndex(
                          (value) => value !== 0
                        ) > context.dataIndex
                        ? [128, 128, 128, 1]
                        : [255, 51, 0, 1]
                      : balances.eventsOverTime.cumulative.photon.findIndex(
                          (value) => value !== 0
                        ) > context.dataIndex
                      ? [128, 128, 128, 1]
                      : [66, 255, 214, 0.75],
                    context.datasetIndex === 0
                      ? balances.eventsOverTime.cumulative.photon.findIndex(
                          (value) => value !== 0
                        ) > context.dataIndex
                        ? [128, 128, 128, 1]
                        : [0, 219, 84, 1]
                      : balances.eventsOverTime.cumulative.photon.findIndex(
                          (value) => value !== 0
                        ) > context.dataIndex
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
              display: true,
              color: "rgba(255, 255, 255, 0.05)",
            },
            ticks: {
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
  }, [balances, started]);

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
              The prediction program is built off-chain for demonstration
              purposes. No funds will be deducted from your wallet.
            </p>
          </div>
        </div>
        <div className={`flex flex-col items-center w-full max-w-7xl px-4`}>
          <h1 className="text-3xl md:text-4xl lg:text-5xl mb-4 text-gray-300 font-bold font-outfit">
            Predict with <span className="text-accent-primary">$ANTI</span> and{" "}
            <span className="text-accent-secondary">$PRO</span>
          </h1>
          <div
            className={`w-full mt-4 md:mt-4 lg:mt-8 flex flex-col lg:flex-row lg:gap-4 ${
              isMetaLoading ? "items-center" : ""
            }`}
          >
            <div className="flex flex-col w-full lg:w-3/4">
              <div className="bg-dark-card p-4 rounded w-full mb-4 border border-gray-800">
                <div className="flex flex-row items-center mb-2">
                  <div className="text-2xl text-gray-300 text-left font-medium">
                    Will SOL overtake ETH in 2025?&nbsp;
                  </div>
                  <span className="relative group">
                    <span className="cursor-pointer text-sm text-gray-400">
                      &#9432;
                      <span className="absolute text-sm p-2 bg-gray-800 rounded-md w-64 -translate-x-3/4 lg:-translate-x-1/2 -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block">
                        {`Truth is measured in terms of Market Capitalisations`}
                      </span>
                    </span>
                  </span>
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
                              ? parseToUTC(
                                  predictionConfig.startTime,
                                  isMobile
                                ) + " UTC"
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
                        ? parseToUTC(predictionConfig.startTime, isMobile)
                        : "..."}
                    </span>
                    &nbsp;&nbsp;
                    {predictionConfig.startTime !== "-" && (
                      <span className="font-sfmono text-gray-600 text-[10px]">
                        UTC
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
                        ? parseToUTC(predictionConfig.endTime, isMobile)
                        : "..."}
                    </span>
                    &nbsp;&nbsp;
                    {predictionConfig.endTime !== "-" && (
                      <span className="font-sfmono text-gray-600 text-[10px]">
                        UTC
                      </span>
                    )}{" "}
                    &nbsp;
                    <span className="relative group">
                      <span className="cursor-pointer">
                        &#9432;
                        <span
                          className={`absolute text-sm p-2 bg-gray-800 rounded-md w-64 z-10 -translate-x-[140px] lg:translate-x-0 -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block`}
                        >
                          {`Prediction market closing date & time: ${
                            predictionConfig.endTime !== "-"
                              ? parseToUTC(predictionConfig.endTime, isMobile) +
                                " UTC"
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
                        <h2 className="text-xl text-gray-300 text-left font-medium flex flex-row items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        </h2>
                        <div className="flex flex-row items-center">
                          <TimeTicker
                            fontSize={isMobile ? 12 : 12}
                            isMobile={isMobile}
                          />
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
                        </div>
                      </div>
                      <div
                        className={`flex gap-1 mt-1 ml-auto font-sfmono ${
                          loading ? "hidden" : "ml-auto"
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
              <div className="mb-8 mt-0">
                <Metadata
                  type="Binary"
                  oracle="Milton AI Agent"
                  truth={
                    truth.join(",") === "0,1" && isOver
                      ? "Yes"
                      : truth.join(",") === "1,0" && isOver
                      ? "No"
                      : "Unknown"
                  }
                  tellers="ChatGPT-o1, Claude Sonnet 3.5, Grok 2"
                  isMobile={isMobile}
                />
              </div>
            </div>
            {showCollider ? (
              <div>
                <div className="flex justify-between items-center px-5 py-2 backdrop-blur-sm bg-dark-card rounded-t-lg border border-gray-800">
                  <h2 className="text-xl text-gray-300 text-left font-medium">
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
                      <div className="mr-1">Switch to Claim</div>
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
                  isMobile={isMobile}
                  bags={bags}
                  inactive={isOver}
                  isMetaLoading={isMetaLoading}
                />
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center px-5 py-2 backdrop-blur-sm bg-dark-card rounded-t-lg border border-gray-800">
                  <h2 className="text-xl text-gray-300 text-left font-medium">
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
                      <div className="mr-1">Switch to Predict</div>
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
                  wallet={wallet}
                  antiBalance={antiBalance}
                  proBalance={proBalance}
                  antiUsage={antiUsage}
                  proUsage={proUsage}
                  baryonBalance={baryonBalance}
                  photonBalance={photonBalance}
                  disabled={!wallet.connected}
                  BASE_URL={BASE_URL}
                  onClaimSubmitted={handleClaimSubmitted}
                  clearFields={clearFields}
                  antiData={antiData}
                  proData={proData}
                  isMobile={isMobile}
                  bags={bags}
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
                : JSON.stringify(currentClaimData)
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
