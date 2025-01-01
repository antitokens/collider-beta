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
import { Stars, ParticleCollision } from "../components/CollisionAnimation";
import { calculateScattering } from "../utils/scatterAlpha";
import Navbar from "../components/TopNavbar";
import BinaryOrbit from "../components/BinaryOrbit";
import Footer from "../components/BottomFooter";
import Dashboard from "../components/Dashboard";
import BuyTokenModal from "../components/BuyTokenModal";
import {
  ANTI_TOKEN_MINT,
  PRO_TOKEN_MINT,
  getTokenBalance,
} from "../utils/solana";
import {
  toastContainerConfig,
  toast,
  useIsMobile,
  emptyMetadata,
  metadataInit,
  emptyGaussian,
  emptyBags,
  convertToLocaleTime,
  formatCount,
} from "../utils/utils";
import { getKVBalance, getMetadata } from "../utils/api";
import { calculateCollision } from "../utils/colliderAlpha";
import "@solana/wallet-adapter-react-ui/styles.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  const [antiData, setAntiData] = useState(null);
  const [proData, setProData] = useState(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [currentPredictionData, setCurrentPredictionData] =
    useState(emptyMetadata);
  const [currentClaimData, setCurrentClaimData] = useState(emptyMetadata);
  const [metadata, setMetadata] = useState(metadataInit);
  const [isMetaLoading, setIsMetaLoading] = useState(true);
  const [metaError, setMetaError] = useState(null);
  const [refresh, setRefresh] = useState(true);
  const [dynamics, setDynamics] = useState([]);
  const isMobile = useIsMobile();

  const onRefresh = (state) => {
    setRefresh(state);
  };

  const handlePredictionSubmitted = (state, eventData) => {
    if (state) {
      // Store the submitted event data
      setCurrentPredictionData(eventData);
      setRefresh(true);
    } else {
      // Handle error case
      console.error("Prediction submission failed:", eventData.error);
    }
    setDataUpdated(state);
    setTrigger(state);
    // Trigger field clearing
    setClearFields(true);
    setTimeout(() => setClearFields(false), 100);
    setTimeout(() => setShowAnimation(state), 100);
  };

  const handleClaimSubmitted = (state, claimData) => {
    if (state) {
      setCurrentClaimData(claimData);
      setRefresh(true);
    } else {
      // Handle error case
      console.error("Prediction submission failed:", claimData.error);
    }
    setDataUpdated(state);
    setTrigger(state);
    // Trigger field clearing
    setClearFields(true);
    setTimeout(() => setClearFields(false), 100);
    setTimeout(() => setShowAnimation(state), 100);
  };

  useEffect(() => {
    const checkMeta = async () => {
      toast.error("Error fetching metadata from server!");
      return;
    };
    if (metaError) checkMeta();
  }, [metaError]);

  useEffect(() => {
    if (refresh) {
      const fetchData = async () => {
        try {
          setIsMetaLoading(true);
          const blob = await getMetadata();
          const data = JSON.parse(blob.message);
          // Calculate distributions using API data
          const colliderDistribution =
            baryonBalance >= 0 && photonBalance > 0.5
              ? calculateCollision(baryonBalance, photonBalance, true)
              : emptyGaussian;
          const totalDistribution =
            data.totalDistribution.u >= 0 && data.totalDistribution.s > 0.5
              ? calculateCollision(
                  data.emissionsData.baryonTokens,
                  data.emissionsData.photonTokens,
                  true
                )
              : emptyGaussian;

          setMetadata({
            startTime: data.startTime,
            endTime: data.endTime,
            colliderDistribution: colliderDistribution,
            totalDistribution: totalDistribution,
            emissionsData: data.emissionsData,
            collisionsData: data.collisionsData,
            eventsOverTime: data.eventsOverTime,
          });
          setBags({
            baryon: data.totalDistribution.baryonBags,
            photon: data.totalDistribution.photonBags,
            baryonPool: data.emissionsData.baryonTokens,
            photonPool: data.emissionsData.photonTokens,
            anti: data.totalDistribution.antiBags,
            pro: data.totalDistribution.proBags,
            antiPool: data.collisionsData.antiTokens,
            proPool: data.collisionsData.proTokens,
            wallets: data.totalDistribution.wallets,
          });
          const rewardCurrent = calculateScattering(
            data.totalDistribution.baryonBags,
            data.totalDistribution.photonBags,
            data.emissionsData.baryonTokens,
            data.emissionsData.photonTokens,
            data.totalDistribution.antiBags,
            data.totalDistribution.proBags,
            data.collisionsData.antiTokens,
            data.collisionsData.proTokens,
            antiData && proData
              ? [Number(antiData.priceUsd), Number(proData.priceUsd)]
              : [1, 1],
            data.totalDistribution.wallets
          );
          setDynamics(rewardCurrent ? rewardCurrent.overlap : []);
        } catch (err) {
          console.error("Error fetching metadata:", err);
          setMetaError(err);
        } finally {
          setIsMetaLoading(false);
        }
      };
      fetchData();
      setRefresh(false);
    }
  }, [refresh, baryonBalance, photonBalance, antiData, proData]);

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
      const _balance = await getKVBalance(wallet.publicKey);
      const balance = JSON.parse(_balance.message);
      setAntiBalance(antiBalanceResult - balance.anti);
      setProBalance(proBalanceResult - balance.pro);
      setAntiUsage(balance.anti);
      setProUsage(balance.pro);
      setBaryonBalance(balance.baryon);
      setPhotonBalance(balance.photon);
      setDataUpdated(false);
      setRefresh(true);
    };

    if (wallet.publicKey) checkBalance();
    if (dataUpdated) checkBalance();
  }, [wallet, dataUpdated]);

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
          <div className="lg:col-span-1 xl:col-span-2 mx-2 md:mx-0">
            {showCollider ? (
              <div className="text-center mt-20">
                <div className="flex justify-between items-center px-5 py-2 backdrop-blur-sm bg-dark-card rounded-t-lg border border-gray-800">
                  <h2 className="text-xl text-gray-300 text-left font-medium">
                    Collider
                  </h2>
                  <button
                    className="text-sm text-accent-primary hover:text-gray-300"
                    onClick={() => setShowCollider(false)}
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
                    startTime: metadata.startTime || "-",
                    endTime: metadata.endTime || "-",
                    antiLive: metadata.collisionsData.antiTokens || 0,
                    proLive: metadata.collisionsData.proTokens || 0,
                  }}
                  isMobile={isMobile}
                  bags={bags}
                />
              </div>
            ) : (
              <div className="mt-20">
                <div className="flex justify-between items-center px-5 py-2 backdrop-blur-sm bg-dark-card rounded-t-lg border border-gray-800">
                  <h2 className="text-xl text-gray-300 text-left font-medium">
                    Inverter
                  </h2>
                  <button
                    className="text-sm text-accent-primary hover:text-gray-300"
                    onClick={() => setShowCollider(true)}
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
                  <div className="bg-dark-card p-4 rounded w-full mb-4 flex flex-col justify-center">
                    <h2 className="text-xl text-gray-300 text-center font-medium mb-2">
                      Claim your Collider Emissions
                    </h2>
                    <div className="flex flex-row justify-between">
                      <div className="text-[12px] text-gray-500 text-left">
                        <span className="relative group">
                          <span className="cursor-pointer">
                            &#9432;
                            <span className="absolute text-sm p-2 bg-gray-800 rounded-md w-64 translate-x-0 lg:translate-x-0 -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block">
                              {isMobile
                                ? `Reclaim opening date & time: ${
                                    metadata.endTime !== "-"
                                      ? isMobile
                                        ? convertToLocaleTime(
                                            metadata.startTime,
                                            isMobile
                                          ).split(",")[0]
                                        : convertToLocaleTime(
                                            metadata.startTime,
                                            isMobile
                                          )
                                      : "-"
                                  }`
                                : "Reclaim opening date & time"}
                            </span>
                          </span>
                        </span>{" "}
                        &nbsp;Open:{" "}
                        <span className="font-sfmono text-gray-400 text-[11px]">
                          {metadata.endTime !== "-"
                            ? isMobile
                              ? convertToLocaleTime(
                                  metadata.endTime,
                                  isMobile
                                ).split(",")[0]
                              : convertToLocaleTime(metadata.endTime, isMobile)
                            : "-"}
                        </span>{" "}
                      </div>
                      <div className="text-[12px] text-gray-500 text-right">
                        Close:{" "}
                        <span className="font-sfmono text-gray-400 text-[11px]">
                          {metadata.endTime !== "-"
                            ? isMobile
                              ? "Never"
                              : "Never"
                            : "-"}
                        </span>{" "}
                        &nbsp;
                        <span className="relative group">
                          <span className="cursor-pointer">
                            &#9432;
                            <span className="absolute text-sm p-2 bg-gray-800 rounded-md w-64 -translate-x-[154px] lg:-translate-x-[25px] -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block">
                              {isMobile
                                ? `Reclaim closing date & time: ${
                                    metadata.endTime !== "-"
                                      ? !isMobile
                                        ? "Never"
                                        : "Never"
                                      : "-"
                                  }`
                                : "Reclaim closing date & time"}
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
                            Total amount of PHOTON & BARYON in the prediction
                            pool
                          </span>
                        </span>{" "}
                        &nbsp;Total Pool:{" "}
                        <span className="font-sfmono text-accent-steel text-[11px] text-opacity-80">
                          {formatCount(metadata.emissionsData.photonTokens)}
                        </span>
                        {"/"}
                        <span className="font-sfmono text-accent-cement text-[11px] text-opacity-90">
                          {formatCount(metadata.emissionsData.baryonTokens)}
                        </span>
                      </div>
                      <div className="text-[12px] text-gray-500 text-right">
                        Token Ratio:{" "}
                        <span className="font-sfmono text-gray-400 text-[11px]">
                          {metadata.emissionsData.baryonTokens > 0
                            ? (
                                metadata.emissionsData.photonTokens /
                                metadata.emissionsData.baryonTokens
                              ).toFixed(3)
                            : "0.000"}
                        </span>{" "}
                        &nbsp;
                        <span className="relative group">
                          <span className="cursor-pointer">
                            &#9432;
                            <span className="absolute text-sm p-2 bg-gray-800 rounded-md w-64 -translate-x-1/2 lg:translate-x-0 -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block">
                              Ratio PHOTON:BARYON in the prediction pool
                            </span>
                          </span>
                        </span>
                      </div>
                    </div>
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
                    config={{
                      startTime: metadata.endTime || "-",
                      endTime: "-",
                      baryonLive: metadata.emissionsData.baryonTokens || 0,
                      photonLive: metadata.emissionsData.photonTokens || 0,
                    }}
                    isMobile={isMobile}
                    bags={bags}
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
                      : "Connect your wallet to enable predictions"}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div
            className={`xl:col-span-3 mx-2 md:mx-0 ${
              isMetaLoading || isMobile
                ? "flex justify-center items-center min-h-[600px]"
                : ""
            }`}
          >
            {!isMetaLoading ? (
              <Dashboard
                emissionsData={metadata.emissionsData}
                collisionsData={metadata.collisionsData}
                eventsOverTime={metadata.eventsOverTime}
                colliderDistribution={metadata.colliderDistribution}
                totalDistribution={metadata.totalDistribution}
                onRefresh={onRefresh}
                state={showCollider}
                connected={wallet.connected}
                dynamics={dynamics}
                holders={bags.wallets}
                isMobile={isMobile}
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
      <ToastContainer {...toastContainerConfig} />
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
