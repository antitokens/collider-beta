import React, { useMemo, useState, useEffect } from "react";
import Head from "next/head";
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
import Metadata from "../components/Metadata";
import { Stars, ParticleCollision } from "../components/CollisionAnimation";
import {
  calculateEqualisation,
  implementEqualisation,
} from "../utils/equaliserAlpha";
import Navbar from "../components/TopNavbar";
import BinaryOrbit from "../components/BinaryOrbit";
import Footer from "../components/BottomFooter";
import DashboardCollider from "../components/DashboardCollider";
import DashboardInverter from "../components/DashboardInverter";
import BuyTokenModal from "../components/BuyTokenModal";
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
  TimeTicker,
  defaultToken,
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
  const [baryonUsage, setBaryonUsage] = useState(0);
  const [photonUsage, setPhotonUsage] = useState(0);
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
  const [isMetaLoading, setIsMetaLoading] = useState(true);
  const [metaError, setMetaError] = useState(null);
  const [refresh, setRefresh] = useState(true);
  const [dynamicsCurrent, setDynamicsCurrent] = useState([]);
  const [dynamicsFinal, setDynamicsFinal] = useState([]);
  const [truth, setTruth] = useState([0, 1]); // ANTI-PRO
  const isMobile = useIsMobile();

  const onRefresh = (state) => {
    setRefresh(state);
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
    if (refresh && !wallet.disconnecting) {
      const fetchBalancesWithClaims = async () => {
        try {
          setIsMetaLoading(true);
          const blobBalance = await getBalances();
          const blobClaim = await getClaims();
          const dataBalance = JSON.parse(blobBalance.message);
          const dataClaim = JSON.parse(blobClaim.message);

          const colliderDistribution =
            baryonBalance + photonBalance > 0
              ? calculateCollision(baryonBalance, photonBalance, true)
              : baryonUsage + photonUsage > 0
              ? calculateCollision(baryonUsage, photonUsage, true)
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
    baryonUsage,
    photonUsage,
    antiData,
    proData,
    isOver,
    truth,
    started,
    wallet,
    wallet.disconnecting,
    wallet.connected,
  ]);

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
      setBaryonUsage(
        !wallet.disconnecting
          ? claim.baryon + claim.photon > 0
            ? balance.baryon
            : balance.baryon
          : 0
      );
      setPhotonUsage(
        !wallet.disconnecting
          ? claim.photon + claim.baryon > 0
            ? balance.photon
            : balance.photon
          : 0
      );
    };

    if (wallet.publicKey || dataUpdated) {
      checkBalance();
      setRefresh(true);
    }
  }, [wallet, dataUpdated, wallet.disconnecting]);

  return (
    <>
      <section className="min-h-screen pt-16 md:pt-20 flex flex-col items-center relative mt-10 mb-10">
        {/* Hero Section */}
        <div className="max-w-7xl w-full mb-8 bg-gray-800 border border-gray-700 text-gray-300 p-4 text-center rounded-md">
          <div className="flex items-center gap-2">
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
        <div className="grid grid-cols-1 lg:grid-cols-[70%,30%] items-center gap-8 max-w-7xl mx-auto px-4">
          {/* Hero Text */}
          <div>
            <h1 className="tracking-tight text-4xl md:text-5xl lg:text-6xl mb-4 text-gray-300 font-bold font-outfit">
              PREDICT WITH
              <br />
              <span className="text-accent-primary">$ANTI</span> and{" "}
              <span className="text-accent-secondary">$PRO</span>
            </h1>
            <p className="font-open font-medium text-xl md:text-[1.35rem] text-gray-300 mb-6">
              Experience the future of prediction markets with Antitoken
            </p>
            <button
              className="bg-accent-primary hover:opacity-90 text-gray-100 px-8 py-3 rounded-full text-lg font-semibold flex items-center gap-2"
              onClick={() => setShowBuyTokensModal(true)}
            >
              <span>Buy Tokens</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-100 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </button>
          </div>

          {/* Hero Image */}
          <div className="flex justify-center relative">
            <div className="absolute w-72 h-72 rounded-full bg-gradient-to-r from-accent-primary/20 to-accent-secondary/20 blur-[50px]"></div>
            <img
              src={`${BASE_URL}/assets/antitoken_logo_large.webp`}
              alt="Antitoken Logo"
              className="w-72 h-72 rounded-full object-cover border-4 border-gray-800/50 relative z-10 transition-transform duration-200 ease-out"
            />
          </div>
        </div>

        {/* Collider Sections Toggle */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 lg:gap-8 max-w-7xl mx-auto">
          {isMobile && <TimeTicker fontSize={11} />}
          <div
            className={`lg:col-span-1 xl:col-span-2 mx-2 md:mx-0 ${
              isMobile ? "" : "mt-20"
            }`}
          >
            {showCollider ? (
              <div className="text-center">
                <div className="flex justify-between items-center px-5 py-2 backdrop-blur-sm bg-dark-card rounded-t-lg border border-gray-800">
                  <div className="flex flex-row items-center">
                    <div
                      className={`w-2 h-2 ${
                        !isOver ? "bg-green-500 animate-pulse" : "bg-gray-500"
                      } rounded-full`}
                    ></div>
                    &nbsp;&nbsp;
                    <div className="text-xl text-gray-300 text-left font-medium">
                      Collider
                    </div>
                    {!isMobile && <TimeTicker />}
                  </div>
                  <button
                    className="text-sm text-accent-primary hover:text-gray-300"
                    onClick={() => {
                      setShowCollider(false),
                        setDataUpdated(false),
                        setRefresh(false);
                    }}
                  >
                    <div className="flex flex-row items-center text-accent-orange hover:text-white transition-colors">
                      <div className="mr-1">Switch to Inverter</div>
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
                  config={{
                    startTime: balances.startTime || "-",
                    endTime: balances.endTime || "-",
                    antiLive:
                      balances.collisionsData.antiTokens -
                        claims.collisionsData.antiTokens || 0,
                    proLive:
                      balances.collisionsData.proTokens -
                        claims.collisionsData.proTokens || 0,
                  }}
                  isMobile={isMobile}
                  bags={bags}
                  balances={balances}
                  inactive={isOver}
                  isMetaLoading={isMetaLoading}
                />
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center px-5 py-2 backdrop-blur-sm bg-dark-card rounded-t-lg border border-gray-800">
                  <div className="flex flex-row items-center">
                    <div
                      className={`w-2 h-2 ${
                        isOver ? "bg-green-500 animate-pulse" : "bg-gray-500"
                      } rounded-full`}
                    ></div>
                    &nbsp;&nbsp;
                    <div className="text-xl text-gray-300 text-left font-medium">
                      Inverter
                    </div>
                    {!isMobile && <TimeTicker />}
                  </div>
                  <button
                    className="text-sm text-accent-primary hover:text-gray-300"
                    onClick={() => {
                      setShowCollider(true),
                        setDataUpdated(false),
                        setRefresh(false);
                    }}
                  >
                    <div className="flex flex-row items-center text-accent-orange hover:text-white transition-colors">
                      <div className="mr-1">Switch to Collider</div>
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
                <div className="flex flex-col items-center justify-center w-full bg-black border-x border-b border-gray-800 rounded-b-lg p-5 relative">
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
                    claims={claims}
                  />
                  <p
                    className={`mt-1 text-sm font-sfmono ${
                      wallet.connected
                        ? "text-gray-300"
                        : "text-red-500 animate-pulse"
                    }`}
                  >
                    {wallet.connected
                      ? ""
                      : "Connect your wallet to enable reclaims"}
                  </p>
                </div>
              </div>
            )}
            <div className="my-4"></div>
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
          {showCollider && (
            <div
              className={`xl:col-span-3 mx-2 md:mx-0 ${
                isMetaLoading || isMobile
                  ? "flex justify-center items-center min-h-[600px]"
                  : ""
              }`}
            >
              {!isMetaLoading ? (
                <DashboardCollider
                  emissionsData={balances.emissionsData}
                  collisionsData={balances.collisionsData}
                  eventsOverTime={balances.eventsOverTime}
                  colliderDistribution={balances.colliderDistribution}
                  totalDistribution={balances.totalDistribution}
                  onRefresh={onRefresh}
                  connected={wallet.connected}
                  dynamics={dynamicsCurrent}
                  holders={bags.wallets}
                  isMobile={isMobile}
                  schedule={[balances.startTime, balances.endTime]}
                />
              ) : (
                <div className="flex justify-center items-center w-full">
                  <BinaryOrbit
                    size={isMobile ? 300 : 300}
                    orbitRadius={isMobile ? 80 : 80}
                    particleRadius={isMobile ? 20 : 20}
                    padding={10}
                    invert={false}
                  />
                </div>
              )}
            </div>
          )}
          {!showCollider && (
            <div
              className={`xl:col-span-3 mx-2 md:mx-0 ${
                isMetaLoading || isMobile
                  ? "flex justify-center items-center min-h-[600px]"
                  : ""
              }`}
            >
              {!isMetaLoading ? (
                <DashboardInverter
                  emissionsData={claims.emissionsData}
                  collisionsData={claims.collisionsData}
                  eventsOverTime={claims.eventsOverTime}
                  colliderDistribution={balances.colliderDistribution}
                  totalDistribution={balances.totalDistribution}
                  onRefresh={onRefresh}
                  connected={wallet.connected}
                  dynamics={dynamicsFinal}
                  holders={bags.wallets}
                  isMobile={isMobile}
                  schedule={[claims.startTime, claims.endTime]}
                  start={isOver}
                />
              ) : (
                <div className="flex justify-center items-center w-full">
                  <BinaryOrbit
                    size={isMobile ? 300 : 300}
                    orbitRadius={isMobile ? 80 : 80}
                    particleRadius={isMobile ? 20 : 20}
                    padding={10}
                    invert={false}
                  />
                </div>
              )}
            </div>
          )}
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
