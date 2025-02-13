import { useState, useEffect } from "react";
import { recordWithdrawal } from "../utils/api";
import { equalise } from "../utils/equaliser";
import { ToastContainer } from "react-toastify";
import { Chart, registerables } from "chart.js";
import BinaryOrbit from "./animation/BinaryOrbit";
import "react-toastify/dist/ReactToastify.css";
import {
  toastContainerConfig,
  toast,
  emptyHoldings,
  formatCount,
  defaultToken,
  emptyMetadata,
  parseToUTC,
} from "../utils/utils";
Chart.register(...registerables);

/* Inverter Container */
const Inverter = ({
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
  onWithdrawalSubmitted,
  clearFields,
  antiData = defaultToken,
  proData = defaultToken,
  isMobile = false,
  holdings = emptyHoldings,
  inactive = true,
  truth = [],
  balances = emptyMetadata,
}) => {
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(inactive);
  const [anti, setAnti] = useState(0);
  const [pro, setPro] = useState(0);
  const [baryon, setBaryon] = useState(0);
  const [photon, setPhoton] = useState(0);
  const [change, setChange] = useState([0, 0, 0]);
  const [updatedBalances, setUpdatedBalances] = useState([0, 0]);
  const [gain, setGain] = useState(0);
  const [fill, setFill] = useState(false);
  const [dollarGain, setDollarGain] = useState(0);

  useEffect(() => {
    setActive(!inactive);
  }, [inactive]);

  // Clear input fields when `clearFields` changes
  useEffect(() => {
    if (clearFields) {
      setAnti(0);
      setPro(0);
      setBaryon(0);
      setPhoton(0);
    }
  }, [clearFields]);

  // Calculate expected returns
  useEffect(() => {
    let myHolding = -1;
    if (wallet.publicKey) {
      const reward =
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
              truth
            )
          : undefined;

      myHolding = reward
        ? reward.change.wallets.indexOf(wallet.publicKey.toString())
        : -1;

      if (proData && antiData && myHolding >= 0) {
        const position =
          proUsage * proData.priceUsd + antiUsage * antiData.priceUsd;
        setChange(
          truth.length > 0 &&
            !wallet.disconnecting &&
            (photonBalance > 0 || baryonBalance > 0)
            ? [
                reward.change.pro[myHolding],
                reward.change.anti[myHolding],
                reward.change.gain[myHolding],
              ]
            : [0, 0, 0]
        );

        setUpdatedBalances(
          truth.length > 0 &&
            !wallet.disconnecting &&
            (photonBalance > 0 || baryonBalance > 0)
            ? [reward.invert.pro[myHolding], reward.invert.anti[myHolding]]
            : !wallet.disconnecting
            ? [0, 0]
            : [0, 0]
        );
        setAnti(
          truth.length > 0 &&
            !wallet.disconnecting &&
            (photonBalance > 0 || baryonBalance > 0)
            ? reward.invert.anti[myHolding]
            : !wallet.disconnecting
            ? 0
            : 0
        );
        setPro(
          truth.length > 0 &&
            !wallet.disconnecting &&
            (photonBalance > 0 || baryonBalance > 0)
            ? reward.invert.pro[myHolding]
            : !wallet.disconnecting
            ? 0
            : 0
        );

        setBaryon(
          truth.length > 0 &&
            !wallet.disconnecting &&
            (photonBalance > 0 || baryonBalance > 0)
            ? reward.invert.baryon[myHolding]
            : !wallet.disconnecting
            ? 0
            : 0
        );
        setPhoton(
          truth.length > 0 &&
            !wallet.disconnecting &&
            (photonBalance > 0 || baryonBalance > 0)
            ? reward.invert.photon[myHolding]
            : !wallet.disconnecting
            ? 0
            : 0
        );
        setDollarGain(
          truth.length > 0 &&
            !wallet.disconnecting &&
            (photonBalance > 0 || baryonBalance > 0)
            ? reward.change.gain[myHolding]
            : 0
        );
        setGain(
          truth.length > 0 &&
            !wallet.disconnecting &&
            position > 0 &&
            (photonBalance > 0 || baryonBalance > 0)
            ? (reward.change.gain[myHolding] / position) * 100
            : 0
        );
      }
    }
  }, [
    antiData,
    proData,
    holdings,
    truth,
    wallet,
    wallet.disconnecting,
    active,
  ]);

  const handleWithdrawal = async () => {
    if (disabled || loading) return;

    try {
      setLoading(true);
      // Validate input
      if (baryon <= 0 && photon <= 0) {
        toast.error("You must claim with at least some tokens!");
        return;
      }

      if (anti !== updatedBalances[1] || pro !== updatedBalances[0]) {
        toast.error("You can only claim maximum available balance!");
        return;
      }

      if (anti > updatedBalances[1] || pro > updatedBalances[0]) {
        toast.error("You cannot claim with more tokens than you have!");
        return;
      }

      if (photon < 0) {
        toast.error("Photons must be larger 0!");
        return;
      }

      if (baryon < 0) {
        toast.error("Baryons must be larger 0!");
        return;
      }

      // Prompt for Solana signature
      const message = `Requesting signature to claim with:
        ${baryon.toFixed(2)} $BARYON,
        ${photon.toFixed(2)} $PHOTON,
        for
        ${anti.toFixed(2)} $ANTI,
        ${pro.toFixed(2)} $PRO
        on prediction ${prediction} with ${colliderBeta},
        with account ${wallet.publicKey.toString()}`;
      const signatureUint8Array = await wallet.signMessage(
        new TextEncoder().encode(message)
      );
      const signature = btoa(String.fromCharCode(...signatureUint8Array));
      const timestamp = new Date().toISOString();
      // Record the withdrawal
      await recordWithdrawal(
        wallet.publicKey.toString(),
        {
          anti: anti,
          pro: pro,
          baryon: baryon,
          photon: photon,
          signature,
          timestamp,
        },
        prediction
      );
      // Create withdrawal data object
      const record = {
        anti: anti,
        pro: pro,
        baryon: baryon,
        photon: photon,
        signature,
        timestamp: timestamp,
        wallet: wallet.publicKey.toString(),
      };
      // Emit the updated data
      onWithdrawalSubmitted(true, record);
      toast.success("Your withdrawal has been recorded!");
    } catch (error) {
      console.error("CLAIM_SUBMISSION_FAILED:", error);
      toast.error("An error occurred while recording your withdrawal");
    } finally {
      setLoading(false);
      setUpdatedBalances([0, 0]);
      setAnti(0);
      setPro(0);
      setBaryon(0);
      setPhoton(0);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full bg-black border-x border-b border-gray-800 rounded-b-lg p-5 relative">
      <div className="flex flex-col items-center bg-dark-card p-4 rounded w-full gap-2">
        <div className="flex flex-row justify-between items-center text-sm text-gray-500 w-full">
          <div className="flex flex-row items-center text-left text-xs">
            <div className="relative group">
              <div className="cursor-pointer">&#9432;&nbsp;</div>
              <span className="absolute text-sm p-2 bg-gray-800 rounded-md w-64 -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block">
                Displays your tokens in withdrawal
              </span>
            </div>
            <div>&nbsp;{`Claim`}:&nbsp;</div>
            <div className="flex flex-row items-center font-sfmono pt-[0px] lg:pt-[2px]">
              <div className="text-accent-secondary text-[11px] opacity-95">
                {!active ? "0.0" : formatCount(updatedBalances[0])}
              </div>
              <div>/</div>
              <div className="text-accent-primary text-[11px] opacity-95">
                {!active ? "0.0" : formatCount(updatedBalances[1])}
              </div>
            </div>
          </div>

          <div className="flex items-center text-[12px]">
            <div className="flex items-center">
              P/L:&nbsp;
              <span className="text-[11px] text-white font-sfmono pt-[0px] lg:pt-[2px]">
                <span className="text-gray-400">$</span>
                {formatCount(dollarGain.toFixed(2))}
              </span>
              <span className="text-[11px] text-gray-400 font-sfmono">
                (
                <span
                  className={`font-sfmono text-${
                    Number(dollarGain) > 0
                      ? "accent-secondary"
                      : Number(dollarGain) < 0
                      ? "accent-primary"
                      : "gray-300"
                  }`}
                >
                  {formatCount(gain.toFixed(2))}%
                </span>
                )&nbsp;
              </span>
              <span className="relative group">
                <span className="cursor-pointer">
                  &#9432;
                  <span className="absolute text-sm p-2 bg-gray-800 rounded-md w-64 -translate-x-[224px] lg:-translate-x-[55px] -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block">
                    {`Displays your current realised profit or loss`}
                  </span>
                </span>
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-row justify-between items-end text-sm text-gray-500 w-full -mt-2">
          <div className="text-[12px] text-gray-500 text-left">
            <span className="relative group">
              <span className="cursor-pointer">
                &#9432;
                <span
                  className={`absolute text-sm p-2 bg-gray-800 rounded-md w-64 translate-x-0 lg:translate-x-0 -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block`}
                >
                  {`Claims opening date & time: ${
                    balances.endTime !== "-" && balances.startTime !== "-"
                      ? parseToUTC(balances.endTime, isMobile) + " UTC"
                      : "..."
                  }`}
                </span>
              </span>
            </span>{" "}
            <span>&nbsp;Start: </span>
            <span className="font-sfmono text-gray-400 text-[11px]">
              {balances.endTime !== "-"
                ? parseToUTC(balances.endTime, isMobile).split(",")[0]
                : "..."}
            </span>{" "}
          </div>
          <div className="flex flex-row text-right text-[12px]">
            <div>
              <span>Change:&nbsp;</span>
              <span className="text-[11px] text-white font-sfmono">
                <span
                  className={`text-${
                    Number(change[0]) > 0
                      ? "accent-secondary"
                      : Number(change[0]) < 0
                      ? "accent-secondary"
                      : "gray-300"
                  }`}
                >
                  {Number(change[0]) > 0
                    ? "+" +
                      Number(change[0])
                        .toFixed(1)
                        .toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    : Number(change[0]) < 0
                    ? "-" +
                      Number(Math.abs(change[0]))
                        .toFixed(1)
                        .toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    : "0.0"}
                </span>
              </span>
              {"/"}
              <span
                className={`text-[11px] font-sfmono text-${
                  Number(change[1]) > 0
                    ? "accent-primary"
                    : Number(change[1]) < 0
                    ? "accent-primary"
                    : "gray-300"
                }`}
              >
                {Number(change[1]) > 0
                  ? "+" +
                    Number(change[1])
                      .toFixed(1)
                      .toString()
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  : Number(change[1]) < 0
                  ? "-" +
                    Number(Math.abs(change[1]))
                      .toFixed(1)
                      .toString()
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  : "0.0"}
              </span>
              &nbsp;&nbsp;
            </div>
            <span className="relative group">
              <div className="cursor-pointer text-xs mt-[2px]">&#9432;</div>
              <span className="absolute text-sm p-2 bg-gray-800 rounded-md w-64 -translate-x-[224px] lg:-translate-x-[55px] -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block">
                {`Displays your current realised changes in PRO & ANTI`}
              </span>
            </span>
          </div>
        </div>
        {/* Fill Button */}
        <button
          onClick={() => setFill(!fill)}
          disabled={
            loading || !active || updatedBalances[0] + updatedBalances[1] <= 0
          }
          className={`w-1/4 my-2 py-1 rounded-3xl transition-all ${
            disabled ||
            loading ||
            !active ||
            fill ||
            updatedBalances[0] + updatedBalances[1] <= 0
              ? "bg-transparent border border-gray-400 text-gray-400 cursor-not-allowed"
              : "bg-transparent border border-accent-primary text-accent-primary hover:border-white hover:text-white"
          }`}
        >
          {!active ? "Closed" : fill ? "Clear" : loading ? "Wait" : "Fill"}
        </button>
      </div>
      <div className="border-[3px] border-black bg-dark-card rounded-full p-2 -my-[0.7rem] z-10">
        <BinaryOrbit
          size={28}
          orbitRadius={10}
          particleRadius={3}
          padding={0}
          invert={true}
        />
      </div>

      {/* Token Output Fields */}
      {active && (
        <div className="bg-dark-card p-4 rounded w-full">
          <div className="mb-4 flex flex-row items-center justify-between space-x-2 sm:space-x-10">
            <div className="flex flex-col items-start justify-between w-full">
              <div className="flex flex-row items-center gap-2 bg-black px-3 py-2 rounded w-full">
                <label
                  htmlFor="anti"
                  className="text-accent-secondary font-medium text-xs sm:text-sm"
                >
                  ${process.env.NEXT_PUBLIC_TEST_TOKENS === "true" ? "t" : ""}
                  PRO
                </label>
                <span className="border-l border-gray-400/50 h-[0.8rem]"></span>
                <input
                  id="pro"
                  type="number"
                  min="0"
                  disabled={true}
                  value={
                    fill ? (Number(pro) > 0 ? Number(pro).toFixed(2) : "") : ""
                  }
                  placeholder="-"
                  className="font-sfmono bg-black text-white text-xs sm:text-sm w-full disabled:cursor-not-allowed"
                  readOnly
                />
              </div>
              <div className={!active ? "hidden" : "text-xs text-gray-500"}>
                <img
                  src={`${BASE_URL}/assets/pro.png`}
                  alt="pro-logo"
                  className="w-3 h-3 mt-[-2px] mr-1 inline-block opacity-75"
                />
                BAL:{" "}
                <span className="font-sfmono text-accent-secondary text-opacity-75">
                  {Number(proBalance)
                    .toFixed(0)
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end justify-between w-full">
              <div className="flex flex-row items-center gap-2 bg-black px-3 py-2 rounded w-full">
                <input
                  id="anti"
                  type="number"
                  min="0"
                  value={
                    fill
                      ? Number(anti) > 0
                        ? Number(anti).toFixed(2)
                        : ""
                      : ""
                  }
                  placeholder="-"
                  disabled={true}
                  className="font-sfmono bg-black text-white text-xs sm:text-sm w-full disabled:cursor-not-allowed text-right"
                  readOnly
                />
                <span className="border-l border-gray-400/50 h-[0.8rem]"></span>
                <label
                  htmlFor="anti"
                  className="text-accent-orange font-medium text-xs sm:text-sm"
                >
                  ${process.env.NEXT_PUBLIC_TEST_TOKENS === "true" ? "t" : ""}
                  ANTI
                </label>
              </div>
              <div className={!active ? "hidden" : "text-xs text-gray-500"}>
                <img
                  src={`${BASE_URL}/assets/anti.png`}
                  alt="anti-logo"
                  className="w-3 h-3 mt-[-2px] mr-1 inline-block opacity-75"
                />
                BAL:{" "}
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
      )}
      <div className="flex flex-row justify-between text-sm text-gray-500 w-full mt-4">
        <div>
          Tokens:{" "}
          <span className="text-[12px] text-white font-sfmono">
            {Number(anti) + Number(pro) > 0 && fill
              ? (Number(anti) + Number(pro)).toFixed(2)
              : "0"}
          </span>
        </div>
        <div>
          USD:{" "}
          <span className="text-[12px] text-white font-sfmono">
            <span className="text-gray-400">$</span>
            {Number(anti) + Number(pro) > 0 && fill
              ? (
                  antiData.priceUsd * Number(anti) +
                  proData.priceUsd * Number(pro)
                ).toFixed(2)
              : "0.00"}
          </span>
        </div>
      </div>
      {/* Submit Button */}
      <button
        onClick={handleWithdrawal}
        disabled={loading || !active || !fill}
        className={`w-full mt-4 py-3 rounded-full transition-all ${
          disabled ||
          loading ||
          !active ||
          !fill ||
          (photon < 1 && photon !== 0)
            ? "bg-gray-500 text-gray-300 cursor-not-allowed"
            : "bg-accent-primary text-white hover:bg-accent-secondary hover:text-black"
        }`}
      >
        {!active
          ? "Closed"
          : !fill
          ? "Please Fill"
          : loading
          ? "Submitting..."
          : "Submit"}
      </button>
      <p
        className={`mt-1 text-sm font-sfmono ${
          wallet.connected ? "text-gray-300" : "text-red-500 animate-pulse"
        }`}
      >
        {wallet.connected ? "" : "Connect your wallet to enable claims"}
      </p>
      <ToastContainer {...toastContainerConfig} />
    </div>
  );
};

export default Inverter;
