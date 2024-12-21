import { useState, useEffect } from "react";
import { toast as toastify } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BadgeCheck, CircleAlert } from "lucide-react";
import { calculateDistribution } from "./colliderAlpha";

// Needed for testing
const partSeed = Math.random();
const votersSeed = Math.random();
const tokensSeed = Math.random();
const votesSeed = Math.random();

// Metadata init
export const metadataInit = {
  voterDistribution: calculateDistribution(
    50 * Math.random(),
    30 * Math.random()
  ),
  totalDistribution: calculateDistribution(
    60 * Math.random(),
    20 * Math.random()
  ),
  votersData: {
    total: 1e5 * votersSeed,
    proVoters: 1e5 * partSeed * votersSeed,
    antiVoters: 1e5 * (1 - partSeed) ** 2 * votersSeed,
  },
  tokensData: {
    total: 1e9 * tokensSeed,
    proTokens: 1e9 * (1 - partSeed) ** 2 * tokensSeed,
    antiTokens: 1e9 * partSeed * tokensSeed,
  },
  votesOverTime: {
    timestamps: ["Dec 6", "Dec 7", "Dec 8", "Dec 9", "Dec 10"],
    proVotes: [
      51210286 * votesSeed,
      10303372 * votesSeed,
      40281190 * votesSeed,
      74538504 * votesSeed,
      12174106 * votesSeed,
    ],
    antiVotes: [
      16543217 * (1 - votesSeed),
      66582982 * (1 - votesSeed),
      14596107 * (1 - votesSeed),
      27472813 * (1 - votesSeed),
      25271918 * (1 - votesSeed),
    ],
    tokenRangesPro: {
      "0-100k": Math.floor(45 * Math.random()),
      "100k-1m": Math.floor(35 * Math.random()),
      "1-10m": Math.floor(20 * Math.random()),
    },
    tokenRangesAnti: {
      "0-100k": Math.floor(30 * Math.random()),
      "100k-1m": Math.floor(40 * Math.random()),
      "1-10m": Math.floor(30 * Math.random()),
    },
  },
};

// Metadata placeholder [test]
export const metaPlaceholder = {
  voterDistribution: {
    value1: 50 * Math.random(),
    value2: 30 * Math.random(),
  },
  totalDistribution: {
    value1: 60 * Math.random(),
    value2: 20 * Math.random(),
  },
  votersData: {
    total: 1e5 * votersSeed,
    proVoters: 1e5 * partSeed * votersSeed,
    antiVoters: 1e5 * (1 - partSeed) ** 2 * votersSeed,
  },
  tokensData: {
    total: 1e9 * tokensSeed,
    proTokens: 1e9 * (1 - partSeed) ** 2 * tokensSeed,
    antiTokens: 1e9 * partSeed * tokensSeed,
  },
  votesOverTime: {
    timestamps: ["Dec 6", "Dec 7", "Dec 8", "Dec 9", "Dec 10"],
    proVotes: [
      51210286 * votesSeed,
      10303372 * votesSeed,
      40281190 * votesSeed,
      74538504 * votesSeed,
      12174106 * votesSeed,
    ],
    antiVotes: [
      16543217 * (1 - votesSeed),
      66582982 * (1 - votesSeed),
      14596107 * (1 - votesSeed),
      27472813 * (1 - votesSeed),
      25271918 * (1 - votesSeed),
    ],
    tokenRangesPro: {
      "0-100k": Math.floor(45 * Math.random()),
      "100k-1m": Math.floor(35 * Math.random()),
      "1-10m": Math.floor(20 * Math.random()),
    },
    tokenRangesAnti: {
      "0-100k": Math.floor(30 * Math.random()),
      "100k-1m": Math.floor(40 * Math.random()),
      "1-10m": Math.floor(30 * Math.random()),
    },
  },
};

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
};

// Base configuration for ToastContainer
export const toastContainerConfig = {
  autoClose: 6000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "dark",
};

// Custom toast functions with styled notifications
export const toast = {
  success: (message) => {
    toastify(message, {
      position: "top-right",
      style: {
        background: "black",
        color: "#48ff00",
        fontFamily: "SF Mono Round",
        fontSize: "18px",
        border: "2px solid #48ff00",
        borderRadius: "8px",
      },
      progressStyle: {
        background: "#48ff00",
      },
      icon: <BadgeCheck className="stroke-[#48ff00]" />,
    });
  },

  error: (message) => {
    toastify(message, {
      position: "top-right",
      style: {
        background: "black",
        color: "#ff1500",
        fontFamily: "SF Mono Round",
        fontSize: "18px",
        border: "2px solid #ff1500",
        borderRadius: "8px",
      },
      progressStyle: {
        background: "#ff1500",
      },
      icon: <CircleAlert className="stroke-[#ff1500]" />,
    });
  },
};

export function truncateMiddle(str, limit, show) {
  if (str.length <= limit) return str;

  const start = str.slice(0, show);
  const end = str.slice(-show);
  return `${start}...${end}`;
}

export function randomiseTextEffect(
  elementId,
  finalText,
  duration = 2000,
  type
) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const characters =
    type === "text"
      ? "Zmf9kQpo41sLtB2NyCaHR7jx3GuYFXAWvgEKVrT8M5dODiwJU06hIPqlcenbSz"
      : "1724596380";

  const interval = 50;
  const chars = finalText.split("");

  // Start immediately with random text, preserving decimals
  element.textContent = chars
    .map((char) =>
      char === "."
        ? "."
        : characters[Math.floor(Math.random() * characters.length)]
    )
    .join("");

  const startTime = performance.now();

  const animate = () => {
    const progress = (performance.now() - startTime) / duration;

    if (progress >= 1) {
      element.textContent = finalText;
      return;
    }

    element.textContent = chars
      .map((char, index) => {
        if (char === ".") return "."; // Always preserve decimal points
        if (progress > index / chars.length) {
          return char;
        }
        return characters[Math.floor(Math.random() * characters.length)];
      })
      .join("");

    requestAnimationFrame(animate);
  };

  requestAnimationFrame(animate);
}

export function convertToLocaleTime(timeString, locale = "en-US") {
  if (!isValidTime(timeString)) {
    throw new Error("Invalid time string format");
  }
  const date = new Date(timeString);
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "full",
    timeStyle: "long",
  }).format(date);
}

export function isValidTime(timeString) {
  // Regular expression to validate HH:MM or HH:MM:SS formats
  const timeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;
  // Test the string against the regex
  return timeRegex.test(timeString);
}

export const emptyMetadata = {
  antiToken: 0.0,
  proToken: 0.0,
  baryonToken: 0.0,
  photonToken: 0.0,
  signature: "-",
  timestamp: "-",
  wallet: "-",
};

export const emptyGaussian = {
  u: 0,
  s: 0,
  range: [],
  distribution: [],
  short: [],
  curve: [],
};
