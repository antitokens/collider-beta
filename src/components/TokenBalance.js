import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import {
  ANTI_TOKEN_MINT,
  getTokenBalance,
  PRO_TOKEN_MINT,
} from "../utils/solana";
import { getBalance, getClaim } from "../utils/api";

/* Token Balances Navbar */

const TokenBalance = (trigger) => {
  const wallet = useWallet();
  const [antiBalance, setAntiBalance] = useState(0);
  const [proBalance, setProBalance] = useState(0);
  const [baryonBalance, setBaryonBalance] = useState(0);
  const [photonBalance, setPhotonBalance] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const checkBalance = async () => {
      const [antiBalanceResult, proBalanceResult] = await Promise.all([
        getTokenBalance(wallet.publicKey, ANTI_TOKEN_MINT),
        getTokenBalance(wallet.publicKey, PRO_TOKEN_MINT),
      ]);
      const blobBalance = await getBalance(wallet.publicKey);
      const blobClaim = await getClaim(wallet.publicKey);
      const dataBalance = JSON.parse(blobBalance.message);
      const dataClaim = JSON.parse(blobClaim.message);
      setAntiBalance(antiBalanceResult - dataBalance.anti + dataClaim.anti);
      setProBalance(proBalanceResult - dataBalance.pro + dataClaim.pro);
      setBaryonBalance(dataClaim.baryon ? 0 : dataBalance.baryon);
      setPhotonBalance(dataClaim.photon ? 0 : dataBalance.photon);
    };

    if (wallet.publicKey) checkBalance();
  }, [wallet, trigger]);

  if (!wallet.publicKey) return null;

  return (
    <div className="mt-2 mb-2">
      <button
        onClick={() => setDropdownOpen(true)}
        onMouseEnter={() => setDropdownOpen(!dropdownOpen)}
        onMouseLeave={() => setDropdownOpen(false)}
        className={`flex justify-center flex-nowrap text-nowrap gap-2 border border-accent-primary/50 w-full bg-transparent text-accent-primary px-3 py-[8px] rounded-3xl text-sm hover:text-gray-300 hover:border-gray-300 ${
          dropdownOpen ? "bg-gray-500" : ""
        }`}
      >
        <span className="block">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 ml-1 transition-transform ${
              !dropdownOpen ? "rotate-180" : ""
            }`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle
              cx="12"
              cy="12"
              r="9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8 12l4-4 4 4M12 8v8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        My Balances
      </button>
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 bg-gray-900 text-gray-300 rounded-lg shadow-lg p-4">
          <div className="grid grid-cols-[auto,auto] gap-2 items-center font-sfmono text-sm">
            <b className="text-accent-secondary">
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;$PRO:
            </b>
            <span>{proBalance ? proBalance.toFixed(2) : "-"}</span>
            <b className="text-accent-primary">
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;$ANTI:
            </b>
            <span>{antiBalance ? antiBalance.toFixed(2) : "-"}</span>
            <b className="text-gray-400">
              RATIO (<span className="text-accent-secondary">P</span>/
              <span className="text-accent-primary">A</span>):
            </b>
            <span>
              {antiBalance > 0 && proBalance > 0
                ? (proBalance / antiBalance).toFixed(2)
                : "-"}
            </span>
            <b className="text-accent-steel">
              &nbsp;&nbsp;&nbsp;&nbsp;$PHOTON:
            </b>
            <span>{proBalance ? photonBalance.toFixed(2) : "-"}</span>
            <b className="text-accent-cement">
              &nbsp;&nbsp;&nbsp;&nbsp;$BARYON:
            </b>
            <span>{proBalance ? baryonBalance.toFixed(2) : "-"}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenBalance;
