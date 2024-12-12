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
import VoteOption from "../components/VoteOption";
import Navbar from "../components/TopNavbar";
import Footer from "../components/BottomFooter";
import Dashboard from "../components/Dashboard";
import BuyTokenModal from "../components/BuyTokenModal";
import { ANTI_TOKEN_MINT, PRO_TOKEN_MINT, getTokenBalance } from "../utils/solana";
import { calculateDistribution } from "../utils/colliderAlpha";
import "@solana/wallet-adapter-react-ui/styles.css";

const Home = ({ BASE_URL }) => {
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
        <Stars />
        <Navbar />
        <LandingPage BASE_URL={BASE_URL} />
        <Footer />
      </div>
    </>
  );
};

function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const Stars = () => {
  const seed = 42; // Fixed seed value
  return (
    <div className="fixed inset-0 pointer-events-none">
      {Array.from({ length: 16 }).map((_, idx) => {
        const randomTop = seededRandom(seed + idx) * 100;
        const randomLeft = seededRandom(seed * idx) * 100;
        const floatDuration = 8 + (idx % 6); // 8s to 14s
        return (
          <div
            key={idx}
            className={`star ${idx % 2 === 0 ? "star-red" : "star-green"}`}
            style={{
              top: `${randomTop}%`,
              left: `${randomLeft}%`,
              animation: `float ${floatDuration}s ease-in-out infinite`,
            }}
          ></div>
        );
      })}
    </div>
  );
};

const LandingPage = ({ BASE_URL }) => {
  const { connected, publicKey } = useWallet();
  const [showBuyTokensModal, setShowBuyTokensModal] = useState(false);
  const [antiBalance, setAntiBalance] = useState(0);
  const [proBalance, setProBalance] = useState(0);

  const voterDistribution = calculateDistribution(50, 30);
  const totalDistribution = calculateDistribution(60, 20);

  const votersSeed = Math.random();
  const votersData = {
    total: 10000 * votersSeed,
    proVoters: 10000 * Math.random() * votersSeed,
    antiVoters: 10000 * Math.random() * (1 - votersSeed),
  };
  const tokensSeed = Math.random();
  const tokensData = {
    total: 999987675,
    proTokens: 999987675 * Math.random() * tokensSeed,
    antiTokens: 999987675 * Math.random() * (1 - tokensSeed),
  };
  const votesSeed = Math.random();
  const votesOverTime = {
    timestamps: ["Dec 6", "Dec 7", "Dec 8", "Dec 9", "Dec 10"],
    proVotes: [
      51210286 * Math.random() * votesSeed,
      10303372 * Math.random() * votesSeed,
      40281190 * Math.random() * votesSeed,
      74538504 * Math.random() * votesSeed,
      12174106 * Math.random() * votesSeed,
    ],
    antiVotes: [
      16543217 * Math.random() * (1 - votesSeed),
      66582982 * Math.random() * (1 - votesSeed),
      14596107 * Math.random() * (1 - votesSeed),
      27472813 * Math.random() * (1 - votesSeed),
      25271918 * Math.random() * (1 - votesSeed),
    ],
    tokenRangesPro: {
      "0-100k": 76 * Math.random(),
      "100k-1M": 67 * Math.random(),
      "1-10M": 57 * Math.random(),
    },
    tokenRangesAnti: {
      "0-100k": 49 * Math.random(),
      "100k-1M": 59 * Math.random(),
      "1-10M": 62 * Math.random(),
    },
  };

  useEffect(() => {
    const checkBalance = async () => {
      const [antiBalanceResult, proBalanceResult] = await Promise.all([
        getTokenBalance(publicKey, ANTI_TOKEN_MINT),
        getTokenBalance(publicKey, PRO_TOKEN_MINT),
      ]);
      setAntiBalance(antiBalanceResult);
      setProBalance(proBalanceResult);
    };

    if (publicKey) checkBalance();
  }, [publicKey]);

  return (
    <>
      <section className="min-h-screen pt-16 md:pt-20 flex flex-col items-center relative mt-10 mb-10">
        {/* Hero Section */}
        <div className="max-w-7xl w-full mb-8 bg-gray-800 border border-gray-700 text-gray-300 p-4 text-center">
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
            <h1 className="tracking-tight text-4xl md:text-5xl lg:text-6xl mb-4 text-gray-300/90 font-semibold font-outfit">
              Vote with{" "}
              <span className="text-accent-primary font-semibold">$ANTI</span>{" "}
              and{" "}
              <span className="text-accent-secondary font-semibold">$PRO</span>{" "}
            </h1>
            <p className="font-open font-medium text-xl md:text-[1.35rem] text-gray-300 mb-6">
              Experience the future of prediction markets with Antitoken
            </p>
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

        {/* Voting Section */}
        <div className="border border-gray-500 rounded-lg p-12 text-center mt-20 px-24 bg-gray-800 bg-opacity-50">
          <h3 className="font-grotesk text-2xl font-medium text-white mb-6">
            Should Dev launch a token on Base?
          </h3>
          <button
              className="text-accent-primary hover:text-white"
              onClick={() =>
                alert(
                  "Your ANTI:PRO ratio, ANTI + PRO sum, and ANTI - PRO difference determines your vote."
                )
              }
              title="Your ANTI:PRO ratio, ANTI + PRO sum, and ANTI - PRO difference determines your vote."
            >
              <svg
                className="w-8 h-8 text-accent-primary dark:text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="#ff4d00"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 11h2v5m-2 0h4m-2.592-8.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
            </button>
          {/* Voting Options */}
          <div className="flex justify-center max-w-md mx-auto">
            <VoteOption
              wallet={publicKey}
              antiBalance={antiBalance}
              proBalance={proBalance}
              disabled={!connected}
            />
          </div>

          {/* Connection Status */}
          <p
            className={`mt-0 text-sm ${
              connected ? "text-gray-300" : "text-red-500 animate-pulse"
            }`}
          >
            {connected
              ? ""
              : "Connect your wallet to enable voting"}
          </p>
        </div>
        <div className="mt-12">
            <Dashboard
              votersData={votersData}
              tokensData={tokensData}
              votesOverTime={votesOverTime}
              voterDistribution={voterDistribution}
              totalDistribution={totalDistribution}
            />
        </div>
        <div className="backdrop-blur-xl bg-dark-card/50 mt-20 p-12 rounded-2xl border border-gray-800 text-center">
          <h2 className="font-grotesk text-3xl font-bold mb-6 bg-gradient-to-r from-accent-primary from-20% to-accent-secondary to-90% bg-clip-text text-transparent">
            Ready to dive in?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join the future of prediction markets
          </p>
          <button
            className="bg-accent-primary hover:opacity-90 text-gray-300 px-8 py-3 rounded-lg text-lg font-semibold"
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
