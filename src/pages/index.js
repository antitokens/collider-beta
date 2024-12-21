import React, { useMemo, useState, useEffect } from "react";
import Head from "next/head";
import Script from "next/script";
import {
  ConnectionProvider,
  WalletProvider,
  useWallet,
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
  LedgerWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import Collider from "../components/Collider";
import InvertCollider from "../components/InvertCollider";
import { Stars, ParticleCollision } from "../components/CollisionAnimation";
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
  useIsMobile,
  emptyMetadata,
  metadataInit,
  emptyGaussian,
} from "../utils/utils";
import { getKVBalance, getMetadata } from "../utils/api";
import { calculateDistribution } from "../utils/colliderAlpha";
import "@solana/wallet-adapter-react-ui/styles.css";

const Home = ({ BASE_URL }) => {
  const [trigger, setTrigger] = useState(null); // Shared state

  return (
    <>
      <Head>
        <title>Antitoken | Vote</title>
        <meta
          name="description"
          content="Experience the future of prediction markets with $ANTI and $PRO tokens."
        />

        {/* Open Graph Meta Tags */}
        <meta property="og:title" content="Antitoken Voting Station" />
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
        <meta name="twitter:title" content="Antitoken Voting Station" />
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
  const [baryonBalance, setBaryonBalance] = useState(0);
  const [photonBalance, setPhotonBalance] = useState(0);
  const [showFirstCollider, setShowFirstCollider] = useState(true);
  const [dataUpdated, setDataUpdated] = useState(false);
  const [clearFields, setClearFields] = useState(false);
  const [antiData, setAntiData] = useState(null);
  const [proData, setProData] = useState(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [currentVoteData, setCurrentVoteData] = useState(emptyMetadata);
  const [currentClaimData, setCurrentClaimData] = useState(emptyMetadata);
  const [metadata, setMetadata] = useState(metadataInit);
  const [isMetaLoading, setIsMetaLoading] = useState(true);
  const [metaError, setMetaError] = useState(null);
  const isMobile = useIsMobile();

  const handleVoteSubmitted = (state, voteData) => {
    if (state) {
      // Store the submitted vote data
      setCurrentVoteData(voteData);
    } else {
      // Handle error case
      console.error("Vote submission failed:", voteData.error);
    }
    setDataUpdated(state);
    setTrigger(state);
    // Trigger field clearing
    setClearFields(true);
    setTimeout(() => setClearFields(false), 100);
    setTimeout(() => setShowAnimation(true), 100);
  };

  const handleClaimSubmitted = (state, claimData) => {
    if (state) {
      setCurrentClaimData(claimData);
    } else {
      // Handle error case
      console.error("Vote submission failed:", claimData.error);
    }
    setDataUpdated(state);
    setTrigger(state);
    // Trigger field clearing
    setClearFields(true);
    setTimeout(() => setClearFields(false), 100);
    setTimeout(() => setShowAnimation(true), 100);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsMetaLoading(true);
        const blob = await getMetadata();
        const data = JSON.parse(blob.message);

        // Calculate distributions using API data
        const voterDistribution =
          data.voterDistribution.value1 > 0 && data.voterDistribution.value2 > 0
            ? calculateDistribution(
                data.voterDistribution.value1,
                data.voterDistribution.value2
              )
            : emptyGaussian;
        const totalDistribution =
          data.totalDistribution.value1 > 0 && data.totalDistribution.value2 > 0
            ? calculateDistribution(
                data.totalDistribution.value1,
                data.totalDistribution.value2
              )
            : emptyGaussian;

        setMetadata({
          voterDistribution,
          totalDistribution,
          votersData: data.votersData,
          tokensData: data.tokensData,
          votesOverTime: data.votesOverTime,
        });
      } catch (err) {
        console.error("Error fetching metadata:", err);
        setMetaError(err);
      } finally {
        setIsMetaLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        // Fetch data for both tokens
        const [antiResponse, proResponse] = await Promise.all([
          fetch(
            "https://api.dexscreener.com/latest/dex/tokens/HB8KrN7Bb3iLWUPsozp67kS4gxtbA4W5QJX4wKPvpump"
          ),
          fetch(
            "https://api.dexscreener.com/latest/dex/tokens/CWFa2nxUMf5d1WwKtG9FS9kjUKGwKXWSjH8hFdWspump"
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
      setBaryonBalance(balance.baryon);
      setPhotonBalance(balance.photon);
      setDataUpdated(false);
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
              The voting program is built off-chain for demonstration purposes.
              No funds will be deducted from your wallet.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[70%,30%] items-center gap-8 max-w-7xl mx-auto px-4">
          {/* Hero Text */}
          <div>
            <h1 className="tracking-tight text-4xl md:text-5xl lg:text-6xl mb-4 text-gray-300 font-bold font-outfit">
              VOTE WITH
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
            {showFirstCollider ? (
              <div className="text-center mt-20">
                <div className="flex justify-between items-center px-5 py-2 backdrop-blur-sm bg-dark-card rounded-t-lg border border-gray-800">
                  <h2 className="text-xl text-gray-300 text-left font-medium">
                    Collider
                  </h2>
                  <button
                    className="text-sm text-accent-primary hover:text-gray-300"
                    onClick={() => setShowFirstCollider(false)}
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
                  baryonBalance={baryonBalance}
                  photonBalance={photonBalance}
                  disabled={!wallet.connected}
                  BASE_URL={BASE_URL}
                  onVoteSubmitted={handleVoteSubmitted}
                  clearFields={clearFields}
                  antiData={antiData}
                  proData={proData}
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
                    onClick={() => setShowFirstCollider(true)}
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
                <div className="border border-gray-800 rounded-b-lg p-5 bg-black text-center">
                  <div className="bg-dark-card p-4 rounded w-full mb-4 flex flex-row justify-center">
                    <h2 className="text-lg text-gray-300 text-left font-medium">
                      Claim your Collider Emissions
                    </h2>
                  </div>
                  <InvertCollider
                    wallet={wallet}
                    antiBalance={antiBalance}
                    proBalance={proBalance}
                    baryonBalance={baryonBalance}
                    photonBalance={photonBalance}
                    disabled={!wallet.connected}
                    BASE_URL={BASE_URL}
                    onClaimSubmitted={handleClaimSubmitted}
                    clearFields={clearFields}
                    antiData={antiData}
                    proData={proData}
                  />
                  <p
                    className={`mt-0 text-sm ${
                      wallet.connected
                        ? "text-gray-300"
                        : "text-red-500 animate-pulse"
                    }`}
                  >
                    {wallet.connected
                      ? ""
                      : "Connect your wallet to enable voting"}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="xl:col-span-3 mx-2 md:mx-0">
            {!isMetaLoading && (
              <Dashboard
                votersData={metadata.votersData}
                tokensData={metadata.tokensData}
                votesOverTime={metadata.votesOverTime}
                voterDistributionData={metadata.voterDistribution}
                totalDistributionData={metadata.totalDistribution}
              />
            )}
            {isMetaLoading && (
              <BinaryOrbit
                size={800}
                orbitRadius={200}
                particleRadius={60}
                padding={10}
                invert={false}
              />
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
            width={1400}
            height={1000}
            incomingSpeed={2}
            outgoingSpeed={1}
            curve={1}
            maxLoops={2}
            inverse={!showFirstCollider}
            isMobile={isMobile}
            metadata={
              showFirstCollider
                ? JSON.stringify(currentVoteData)
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
