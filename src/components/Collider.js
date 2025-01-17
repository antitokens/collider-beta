import { useState, useEffect, useRef } from "react";
import { recordPrediction } from "../utils/api";
import BinaryOrbit from "../components/BinaryOrbit";
import { ToastContainer } from "react-toastify";
import { Chart, registerables } from "chart.js";
import "react-toastify/dist/ReactToastify.css";
import {
  toastContainerConfig,
  toast,
  formatCount,
  defaultToken,
  copyText,
} from "../utils/utils";
Chart.register(...registerables);

/* Collider Container */
const Collider = ({
  poll = 0,
  wallet,
  antiBalance,
  proBalance,
  antiUsage,
  proUsage,
  disabled,
  BASE_URL,
  onPredictionSubmitted,
  clearFields,
  antiData = defaultToken,
  proData = defaultToken,
  isMobile = false,
  inactive = true,
  isMetaLoading = true,
}) => {
  const [loading, setLoading] = useState(isMetaLoading);
  const [antiTokens, setAntiTokens] = useState(0);
  const [proTokens, setProTokens] = useState(0);
  const [totalInvest, setTotalInvest] = useState(0);
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

  // Clear input fields when `clearFields` changes
  useEffect(() => {
    if (clearFields) {
      setAntiTokens(0);
      setProTokens(0);
      setTotalInvest(0);
      setSplitPercentage(50);
      handleSliderInput(50);
    }
  }, [clearFields]);

  const handlePrediction = async () => {
    if (disabled || loading) return;

    try {
      setLoading(true);

      // Validate input
      if (antiTokens <= 0 && proTokens <= 0) {
        toast.error("You must vote with at least some tokens!");
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
        toast.error("You cannot vote with more tokens than you have!");
        return;
      }

      // Prompt for Solana signature
      const message = `Requesting signature to vote with:
        ${antiTokens.toFixed(2)} $ANTI,
        ${proTokens.toFixed(2)} $PRO,
        on '${poll}',
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
          antiTokens: antiTokens + antiUsage,
          proTokens: proTokens + proUsage,
          baryonTokens: 0, // Force Baryon = 0
          photonTokens: 0, // Force Photon = 0
          signature,
          timestamp,
        },
        poll
      );
      // Create prediction data object
      const prediction = {
        antiTokens: antiTokens + antiUsage,
        proTokens: proTokens + proUsage,
        baryonTokens: 0,
        photonTokens: 0,
        signature,
        timestamp: timestamp,
        wallet: wallet.publicKey.toString(),
      };
      onPredictionSubmitted(true, prediction);
      toast.success("Your vote has been recorded!");
    } catch (error) {
      console.error("VOTE_SUBMISSION_FAILED:", error);
      toast.error("An error occurred while recording your vote");
      onPredictionSubmitted(false, { error: error.message });
    } finally {
      setLoading(false);
    }
  };

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
                  Displays your total tokens in the poll
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
            <div className="flex flex-row items-left text-[12px] text-gray-500">
              <div className="relative group">
                <div className="cursor-pointer">&#9432;&nbsp;</div>
                <span className="absolute text-sm p-2 bg-gray-800 rounded-md w-64 -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block">
                  Displays your current tokens in the poll
                </span>
              </div>
              <div>&nbsp;{`Current`}:&nbsp;</div>
              <div className="flex flex-row justify-center font-sfmono pt-[0px] lg:pt-[1px]">
                <div className={`text-accent-secondary text-[11px] opacity-95`}>
                  {proUsage > 0 ? "+" : ""}
                  {formatCount(proTokens.toFixed(2))}
                </div>
                <div>/</div>
                <div className={`text-accent-primary text-[11px] opacity-95`}>
                  {antiUsage > 0 ? "+" : ""}
                  {formatCount(antiTokens.toFixed(2))}
                </div>
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
                {`${process.env.NEXT_PUBLIC_TEST_TOKENS ? "t" : ""}PRO`}
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
                {`${process.env.NEXT_PUBLIC_TEST_TOKENS ? "t" : ""}ANTI`}
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
