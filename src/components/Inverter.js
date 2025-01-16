import { useState, useEffect } from "react";
import { recordClaim } from "../utils/api";
import { implementEqualisation } from "../utils/equaliserAlpha";
import { ToastContainer } from "react-toastify";
import { Chart, registerables } from "chart.js";
import BinaryOrbit from "./BinaryOrbit";
import "react-toastify/dist/ReactToastify.css";
import {
  toastContainerConfig,
  toast,
  emptyBags,
  formatCount,
  formatPrecise,
  defaultToken,
  parseToUTC,
  metadataInit,
} from "../utils/utils";
Chart.register(...registerables);

/* Inverter Container */

const Inverter = ({
  wallet,
  antiBalance,
  proBalance,
  antiUsage,
  proUsage,
  baryonBalance,
  photonBalance,
  disabled,
  BASE_URL,
  onClaimSubmitted,
  clearFields,
  antiData = defaultToken,
  proData = defaultToken,
  isMobile = false,
  bags = emptyBags,
  inactive = true,
  truth = [],
  balances = metadataInit,
  claims = metadataInit,
}) => {
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(false);
  const [antiTokens, setAntiTokens] = useState(0);
  const [proTokens, setProTokens] = useState(0);
  const [baryonTokens, setBaryonTokens] = useState(0);
  const [photonTokens, setPhotonTokens] = useState(0);
  const [change, setChange] = useState([0, 0, 0]);
  const [updatedBalances, setUpdatedBalances] = useState([0, 0]);
  const [gain, setGain] = useState(0);
  const [dollarGain, setDollarGain] = useState(0);

  // Clear input fields when `clearFields` changes
  useEffect(() => {
    // Calculate expected rewardCurrents
    let myBag = -1;
    if (wallet.publicKey) {
      const rewardCurrent =
        bags !== emptyBags
          ? implementEqualisation(
              bags.baryon,
              bags.photon,
              bags.anti,
              bags.pro,
              bags.antiPool,
              bags.proPool,
              antiData && proData
                ? [Number(antiData.priceUsd), Number(proData.priceUsd)]
                : [1, 1],
              bags.wallets,
              truth
            )
          : undefined;

      myBag = rewardCurrent
        ? rewardCurrent.change.wallets.indexOf(wallet.publicKey.toString())
        : -1;

      if (proData && antiData && myBag >= 0) {
        const originalPosition =
          proUsage * proData.priceUsd + antiUsage * antiData.priceUsd;
        setChange(
          truth.length > 0 &&
            !wallet.disconnecting &&
            (photonBalance > 0 || baryonBalance > 0)
            ? [
                rewardCurrent.change.photon[myBag],
                rewardCurrent.change.baryon[myBag],
                rewardCurrent.change.gain[myBag],
              ]
            : [0, 0, 0]
        );
        setUpdatedBalances(
          truth.length > 0 &&
            !wallet.disconnecting &&
            (photonBalance > 0 || baryonBalance > 0)
            ? [
                rewardCurrent.invert.photon[myBag],
                rewardCurrent.invert.baryon[myBag],
              ]
            : !wallet.disconnecting
            ? [photonBalance, baryonBalance]
            : [0, 0]
        );
        setAntiTokens(
          truth.length > 0 &&
            !wallet.disconnecting &&
            (photonTokens > 0 || baryonTokens > 0)
            ? rewardCurrent.invert.anti[myBag]
            : 0
        );
        setProTokens(
          truth.length > 0 &&
            !wallet.disconnecting &&
            (photonTokens > 0 || baryonTokens > 0)
            ? rewardCurrent.invert.pro[myBag]
            : 0
        );
        setDollarGain(
          truth.length > 0 &&
            !wallet.disconnecting &&
            (photonBalance > 0 || baryonBalance > 0)
            ? rewardCurrent.change.gain[myBag]
            : 0
        );
        setGain(
          truth.length > 0 &&
            !wallet.disconnecting &&
            originalPosition > 0 &&
            (photonBalance > 0 || baryonBalance > 0)
            ? (rewardCurrent.change.gain[myBag] / originalPosition) * 100
            : 0
        );
      }
    }
  }, [
    antiData,
    proData,
    bags,
    truth,
    wallet,
    wallet.disconnecting,
    photonTokens,
    baryonTokens,
  ]);

  // Clear input fields when `clearFields` changes
  useEffect(() => {
    if (clearFields) {
      setAntiTokens(0);
      setProTokens(0);
      setBaryonTokens(0);
      setPhotonTokens(0);
    }
  }, [clearFields]);

  useEffect(() => {
    setActive(!inactive);
  }, [inactive]);

  const handleReclaim = async () => {
    if (disabled || loading) return;

    try {
      setLoading(true);
      // Validate input
      if (baryonTokens <= 0 && photonTokens <= 0) {
        toast.error("You must claim with at least some tokens!");
        return;
      }

      if (
        baryonTokens !== updatedBalances[1] ||
        photonTokens !== updatedBalances[0]
      ) {
        toast.error("You can only claim maximum available balance!");
        return;
      }

      if (
        baryonTokens > updatedBalances[1] ||
        photonTokens > updatedBalances[0]
      ) {
        toast.error("You cannot claim with more tokens than you have!");
        return;
      }

      if (photonTokens < 0) {
        toast.error("Photons must be larger 0!");
        return;
      }

      if (baryonTokens < 0) {
        toast.error("Baryons must be larger 0!");
        return;
      }

      // Prompt for Solana signature
      const message = `Requesting signature to claim with:
        ${baryonTokens.toFixed(2)} $BARYON,
        ${photonTokens.toFixed(2)} $PHOTON,
        for
        ${antiTokens.toFixed(2)} $ANTI,
        ${proTokens.toFixed(2)} $PRO
        with account ${wallet.publicKey.toString()}`;
      const signatureUint8Array = await wallet.signMessage(
        new TextEncoder().encode(message)
      );
      const signature = btoa(String.fromCharCode(...signatureUint8Array));
      const timestamp = new Date().toISOString();
      // Record the claim
      await recordClaim(wallet.publicKey.toString(), {
        antiTokens: antiTokens,
        proTokens: proTokens,
        baryonTokens: baryonTokens,
        photonTokens: photonTokens,
        signature,
        timestamp,
      });
      // Create claim data object
      const claim = {
        antiTokens: antiTokens,
        proTokens: proTokens,
        baryonTokens: baryonTokens,
        photonTokens: photonTokens,
        signature,
        timestamp: timestamp,
        wallet: wallet.publicKey.toString(),
      };
      // Emit the updated data
      onClaimSubmitted(true, claim);
      toast.success("Your claim has been recorded!");
    } catch (error) {
      console.error("CLAIM_SUBMISSION_FAILED:", error);
      toast.error("An error occurred while recording your claim");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
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
                        balances.endTime !== "-"
                          ? isMobile
                            ? parseToUTC(balances.endTime, isMobile) + " UTC"
                            : parseToUTC(balances.endTime, isMobile).split(
                                ","
                              )[0]
                          : "..."
                      }`
                    : "Reclaim opening date & time"}
                </span>
              </span>
            </span>{" "}
            &nbsp;Start:{" "}
            <span className="font-sfmono text-gray-400 text-[11px]">
              {balances.endTime !== "-"
                ? isMobile
                  ? parseToUTC(balances.endTime, isMobile).split(",")[0]
                  : parseToUTC(balances.endTime, isMobile) + " UTC"
                : "..."}
            </span>{" "}
          </div>
          <div className="text-[12px] text-gray-500 text-right">
            Close:{" "}
            <span className="font-sfmono text-gray-400 text-[11px]">
              {balances.endTime !== "-"
                ? isMobile
                  ? "Never"
                  : "Never"
                : "..."}
            </span>{" "}
            &nbsp;
            <span className="relative group">
              <span className="cursor-pointer">
                &#9432;
                <span className="absolute text-sm p-2 bg-gray-800 rounded-md w-64 -translate-x-[154px] lg:-translate-x-[25px] -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block">
                  {isMobile
                    ? `Reclaim closing date & time: ${
                        balances.endTime !== "-"
                          ? !isMobile
                            ? "Never"
                            : "Never"
                          : "..."
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
                Total amount of PHOTON & BARYON in the prediction pool
              </span>
            </span>{" "}
            &nbsp;Total Pool:{" "}
            <span className="font-sfmono text-accent-steel text-[11px] text-opacity-80">
              {formatCount(
                balances.emissionsData.photonTokens -
                  claims.emissionsData.photonTokens
              )}
            </span>
            {"/"}
            <span className="font-sfmono text-accent-cement text-[11px] text-opacity-90">
              {formatCount(
                balances.emissionsData.baryonTokens -
                  claims.emissionsData.baryonTokens
              )}
            </span>
          </div>
          <div className="text-[12px] text-gray-500 text-right">
            Token Ratio:{" "}
            <span className="font-sfmono text-gray-400 text-[11px]">
              {balances.emissionsData.baryonTokens -
                claims.emissionsData.baryonTokens >
              0
                ? (
                    (balances.emissionsData.photonTokens -
                      claims.emissionsData.photonTokens) /
                    (balances.emissionsData.baryonTokens -
                      claims.emissionsData.baryonTokens)
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
      {/* Emission Input */}
      <div className="flex flex-col items-center justify-between bg-dark-card w-full p-4 rounded gap-2">
        <div className="text-lg text-gray-300 mb-2">Reclaim</div>
        <div className="flex flex-row justify-between items-center text-sm text-gray-500 w-full">
          <div className="flex items-center text-left text-xs">
            <div className="relative group flex items-center">
              <div className="cursor-pointer">&#9432;&nbsp;</div>
              <span className="absolute text-sm p-2 bg-gray-800 rounded-md w-64 -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block">
                Displays your current tokens in the pool
              </span>
            </div>
            <div className="flex items-center">
              <div>&nbsp;Your Tokens:&nbsp;</div>
              <div className="flex items-center font-sfmono pt-[0px] lg:pt-[2px]">
                <div className="text-accent-steel text-[11px] opacity-95">
                  {formatPrecise(updatedBalances[0])}
                </div>
                <div>/</div>
                <div className="text-accent-cement text-[11px] opacity-95">
                  {formatPrecise(updatedBalances[1])}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center text-[12px]">
            <div className="flex items-center">
              Realised P/L:&nbsp;
              <span className="text-[11px] text-white font-sfmono pt-[0px] lg:pt-[2px]">
                <span className="text-gray-400">$</span>
                {formatCount(dollarGain.toFixed(2))}
              </span>
            </div>
            <div className="flex items-center ml-1 pt-[0px] lg:pt-[2px]">
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
                )
              </span>
              <span className="relative group flex items-center ml-1 pb-[2px]">
                <div className="cursor-pointer text-xs">&#9432;</div>
                <span className="absolute text-sm p-2 bg-gray-800 rounded-md w-64 -translate-x-[224px] lg:-translate-x-[55px] -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block">
                  {`Displays your current realised profit or loss`}
                </span>
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-row justify-between items-end text-sm text-gray-500 w-full -mt-2">
          <div className="flex text-left text-md">
            <div>{isMobile ? "Claim Tokens" : "Claim Tokens from Pool"}</div>
          </div>
          <div className="flex flex-row text-right text-[12px]">
            <div>
              Token Change:{" "}
              <span className="text-[11px] text-white font-sfmono">
                <span
                  className={`font-sfmono text-${
                    Number(change[0]) > 0
                      ? "accent-secondary"
                      : Number(change[0]) < 0
                      ? "accent-primary"
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
                    : "0"}
                </span>
              </span>
              {"/"}
              <span
                className={`text-[11px] font-sfmono text-${
                  Number(change[1]) > 0
                    ? "accent-secondary"
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
                  : "0"}
              </span>
              &nbsp;&nbsp;
            </div>
            <span className="relative group">
              <div className="cursor-pointer text-xs mt-[2px]">&#9432;</div>
              <span className="absolute text-sm p-2 bg-gray-800 rounded-md w-64 -translate-x-[224px] lg:-translate-x-[55px] -translate-y-full -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block">
                {`Displays your current realised changes in PHOTON & BARYON`}
              </span>
            </span>
          </div>
        </div>
        <div className="flex flex-row items-center w-full">
          <div className="flex flex-col items-start w-full mr-2">
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
                min={updatedBalances[0]}
                max={updatedBalances[0]}
                value={Math.abs(photonTokens) || ""}
                disabled={inactive}
                onChange={(e) =>
                  setPhotonTokens(Math.abs(Number(e.target.value)))
                }
                onFocus={(e) => e.target.select()}
                placeholder="0"
                className="font-sfmono bg-black text-white text-xs sm:text-sm w-full"
              />
            </div>
            <div className="flex flex-row justify-between items-center w-full">
              <div className={inactive ? "hidden" : "text-xs text-gray-500"}>
                <img
                  src={`${BASE_URL}/assets/photon.png`}
                  alt="photon-logo"
                  className="w-3 h-3 mt-[-2px] mr-1 inline-block opacity-75"
                />
                BAL:&nbsp;
                <span className="font-sfmono text-gray-400">
                  {Number(updatedBalances[0])
                    .toFixed(2)
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </span>
              </div>
              <div
                className={`flex flex-row justify-between gap-1 ${
                  inactive ? "hidden" : ""
                }`}
              >
                <div
                  className="font-grotesk text-[10px] text-gray-400 hover:text-white hover:cursor-pointer animate-pulse duration-1000"
                  onClick={() => setPhotonTokens(Number(updatedBalances[0]))}
                >
                  MAX
                </div>
                <div className="relative group">
                  <div className="cursor-pointer text-[10px] text-gray-400">
                    &#9432;&nbsp;
                  </div>
                  <span className="absolute text-sm p-2 bg-gray-800 rounded-md w-64 -translate-y-full -translate-x-1/2 -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block">
                    Only maximum balance can be reclaimed
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-row items-center w-full">
            <div className="flex flex-col items-end w-full ml-2">
              <div className="flex flex-row items-center gap-2 bg-black px-3 py-2 rounded w-full">
                <input
                  id="baryonTokens"
                  type="number"
                  min={updatedBalances[1]}
                  max={updatedBalances[1]}
                  disabled={inactive}
                  value={Math.abs(baryonTokens) || ""}
                  onChange={(e) =>
                    setBaryonTokens(Math.abs(Number(e.target.value)))
                  }
                  onFocus={(e) => e.target.select()}
                  placeholder="0"
                  className="w-full font-sfmono bg-black text-white text-xs sm:text-sm w-full text-right"
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
                className={`flex flex-row justify-between items-center w-full ${
                  inactive ? "hidden" : ""
                }`}
              >
                <div className="flex flex-row justify-between gap-1">
                  <div
                    className="font-grotesk text-[10px] text-gray-400 hover:text-white hover:cursor-pointer animate-pulse duration-1000"
                    onClick={() => setBaryonTokens(Number(updatedBalances[1]))}
                  >
                    MAX
                  </div>
                  <div className="relative group">
                    <div className="cursor-pointer text-[10px] text-gray-400">
                      &#9432;&nbsp;
                    </div>
                    <span className="absolute text-sm p-2 bg-gray-800 rounded-md w-64 -translate-y-full -translate-x-1/2 -mt-6 md:-mt-8 text-center text-gray-300 hidden group-hover:block">
                      Only maximum balance can be reclaimed
                    </span>
                  </div>
                </div>
                <div className={inactive ? "hidden" : "text-xs text-gray-500"}>
                  <img
                    src={`${BASE_URL}/assets/baryon.png`}
                    alt="baryon-logo"
                    className="w-3 h-3 mt-[-2px] mr-1 inline-block opacity-75"
                  />
                  BAL:&nbsp;
                  <span className="font-sfmono text-gray-400">
                    {Number(updatedBalances[1])
                      .toFixed(2)
                      .toString()
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </span>
                </div>
              </div>
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
                  htmlFor="antiTokens"
                  className="text-accent-secondary font-medium text-xs sm:text-sm"
                >
                  ${process.env.NEXT_PUBLIC_TEST_TOKENS ? "t" : ""}PRO
                </label>
                <span className="border-l border-gray-400/50 h-[0.8rem]"></span>
                <input
                  id="proTokens"
                  type="number"
                  min="0"
                  disabled={true}
                  value={
                    Number(proTokens) > 0 ? Number(proTokens).toFixed(2) : ""
                  }
                  placeholder="-"
                  className="font-sfmono bg-black text-white text-xs sm:text-sm w-full disabled:cursor-not-allowed"
                  readOnly
                />
              </div>
              <div className={inactive ? "hidden" : "text-xs text-gray-500"}>
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
                  id="antiTokens"
                  type="number"
                  min="0"
                  value={
                    Number(antiTokens) > 0 ? Number(antiTokens).toFixed(2) : ""
                  }
                  placeholder="-"
                  disabled={true}
                  className="font-sfmono bg-black text-white text-xs sm:text-sm w-full disabled:cursor-not-allowed text-right"
                  readOnly
                />
                <span className="border-l border-gray-400/50 h-[0.8rem]"></span>
                <label
                  htmlFor="antiTokens"
                  className="text-accent-orange font-medium text-xs sm:text-sm"
                >
                  ${process.env.NEXT_PUBLIC_TEST_TOKENS ? "t" : ""}ANTI
                </label>
              </div>
              <div className={inactive ? "hidden" : "text-xs text-gray-500"}>
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
          Total Tokens in Reclaim:{" "}
          <span className="text-[12px] text-white font-sfmono">
            {Number(antiTokens) + Number(proTokens)
              ? (Number(antiTokens) + Number(proTokens)).toFixed(2)
              : "0"}
          </span>
        </div>
        <div>
          USD Value:{" "}
          <span className="text-[12px] text-white font-sfmono">
            <span className="text-gray-400">$</span>
            {Number(antiTokens) + Number(proTokens)
              ? (
                  antiData.priceUsd * Number(antiTokens) +
                  proData.priceUsd * Number(proTokens)
                ).toFixed(2)
              : "0.00"}
          </span>
        </div>
      </div>
      {/* Submit Button */}
      <button
        onClick={handleReclaim}
        disabled={
          disabled ||
          loading ||
          inactive ||
          (baryonTokens <= 0 && photonTokens <= 0)
        }
        className={`w-full mt-4 py-3 rounded-full transition-all ${
          disabled ||
          loading ||
          inactive ||
          (photonTokens < 1 && photonTokens !== 0) ||
          baryonTokens !== updatedBalances[1] ||
          photonTokens !== updatedBalances[0]
            ? "bg-gray-500 text-gray-300 cursor-not-allowed"
            : "bg-accent-primary text-white hover:bg-accent-secondary hover:text-black"
        }`}
      >
        {inactive
          ? "Closed"
          : baryonTokens > 0 || photonTokens > 0
          ? "Reclaim"
          : loading
          ? "Reclaiming..."
          : "Reclaim"}
      </button>
      <ToastContainer {...toastContainerConfig} />
    </div>
  );
};

export default Inverter;
