import { useState, useEffect } from "react";
import { toast as toastify } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BadgeCheck, CircleAlert } from "lucide-react";
import { calculateCollision } from "./colliderAlpha";

// // Metadata init [test]
const _Seed = Math.random();
const emissionsSeed = Math.random();
const collisionsSeed = Math.random();
const eventsSeed = Math.random();

export const metadataInit = {
  startTime: "-",
  endTime: "-",
  colliderDistribution: {
    u: calculateCollision(50 * Math.random(), 30 * Math.random()).u,
    s: calculateCollision(20 * Math.random(), 30 * Math.random()).s,
  },
  totalDistribution: {
    u: calculateCollision(60 * Math.random(), 30 * Math.random()).u,
    s: calculateCollision(30 * Math.random(), 30 * Math.random()).s,
    baryonBags: [],
    photonBags: [],
    antibags: [],
    probags: [],
    wallets: [],
  },
  emissionsData: {
    total: 1e5 * emissionsSeed,
    photonTokens: 1e5 * _Seed * emissionsSeed,
    baryonTokens: 1e5 * (1 - _Seed) ** 2 * emissionsSeed,
  },
  collisionsData: {
    total: 1e9,
    proTokens: 0,
    antiTokens: 0,
  },
  eventsOverTime: {
    timestamps: ["Dec 6", "Dec 7", "Dec 8", "Dec 9", "Dec 10"],
    proEvents: [
      51210286 * eventsSeed,
      10303372 * eventsSeed,
      40281190 * eventsSeed,
      74538504 * eventsSeed,
      12174106 * eventsSeed,
    ],
    antiEvents: [
      16543217 * (1 - eventsSeed),
      66582982 * (1 - eventsSeed),
      14596107 * (1 - eventsSeed),
      27472813 * (1 - eventsSeed),
      25271918 * (1 - eventsSeed),
    ],
    photonEvents: [
      1643217 * (1 - eventsSeed),
      6658982 * (1 - eventsSeed),
      1459617 * (1 - eventsSeed),
      2772813 * (1 - eventsSeed),
      2571918 * (1 - eventsSeed),
    ],
    baryonEvents: [
      1654217 * (1 - eventsSeed),
      6682982 * (1 - eventsSeed),
      1459607 * (1 - eventsSeed),
      2472813 * (1 - eventsSeed),
      2527118 * (1 - eventsSeed),
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
    tokenRangesPhoton: {
      "0-100k": Math.floor(25 * Math.random()),
      "100k-1m": Math.floor(55 * Math.random()),
      "1-10m": Math.floor(35 * Math.random()),
    },
    tokenRangesBaryon: {
      "0-100k": Math.floor(35 * Math.random()),
      "100k-1m": Math.floor(40 * Math.random()),
      "1-10m": Math.floor(65 * Math.random()),
    },
  },
};

// Metadata placeholder [test]
export const metaPlaceholder = {
  startTime: "-",
  endTime: "-",
  colliderDistribution: {
    u: 50 * Math.random(),
    s: 30 * Math.random(),
  },
  totalDistribution: {
    u: 60 * Math.random(),
    s: 20 * Math.random(),
    baryonBags: [],
    photonBags: [],
    antibags: [],
    probags: [],
    wallets: [],
  },
  emissionsData: {
    total: 1e5 * emissionsSeed,
    photonTokens: 1e5 * _Seed * emissionsSeed,
    baryonTokens: 1e5 * (1 - _Seed) ** 2 * emissionsSeed,
  },
  collisionsData: {
    total: 1e9 * collisionsSeed,
    proTokens: 1e9 * (1 - _Seed) ** 2 * collisionsSeed,
    antiTokens: 1e9 * _Seed * collisionsSeed,
  },
  eventsOverTime: {
    timestamps: ["Dec 6", "Dec 7", "Dec 8", "Dec 9", "Dec 10"],
    proEvents: [
      51210286 * eventsSeed,
      10303372 * eventsSeed,
      40281190 * eventsSeed,
      74538504 * eventsSeed,
      12174106 * eventsSeed,
    ],
    antiEvents: [
      16543217 * (1 - eventsSeed),
      66582982 * (1 - eventsSeed),
      14596107 * (1 - eventsSeed),
      27472813 * (1 - eventsSeed),
      25271918 * (1 - eventsSeed),
    ],
    photonEvents: [
      1643217 * (1 - eventsSeed),
      6658982 * (1 - eventsSeed),
      1459617 * (1 - eventsSeed),
      2772813 * (1 - eventsSeed),
      2571918 * (1 - eventsSeed),
    ],
    baryonEvents: [
      1654217 * (1 - eventsSeed),
      6682982 * (1 - eventsSeed),
      1459607 * (1 - eventsSeed),
      2472813 * (1 - eventsSeed),
      2527118 * (1 - eventsSeed),
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
    tokenRangesPhoton: {
      "0-100k": Math.floor(25 * Math.random()),
      "100k-1m": Math.floor(55 * Math.random()),
      "1-10m": Math.floor(35 * Math.random()),
    },
    tokenRangesBaryon: {
      "0-100k": Math.floor(35 * Math.random()),
      "100k-1m": Math.floor(40 * Math.random()),
      "1-10m": Math.floor(65 * Math.random()),
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
        background: "#111212",
        color: "#48ff00",
        fontFamily: "SF Mono Round",
        fontSize: "18px",
        border: "2px solid #48ff00c1",
        borderRadius: "8px",
      },
      progressStyle: {
        background: "#48ff00c1",
      },
      icon: <BadgeCheck className="stroke-[#48ff00]" />,
    });
  },

  error: (message) => {
    toastify(message, {
      position: "top-right",
      style: {
        background: "#111212",
        color: "#ff1500",
        fontFamily: "SF Mono Round",
        fontSize: "18px",
        border: "2px solid #ff1500c1",
        borderRadius: "8px",
      },
      progressStyle: {
        background: "#ff1500c1",
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

export function convertToLocaleTime(
  timeString,
  isMobile = false,
  locale = "en-US"
) {
  if (!isValidTime(timeString)) {
    throw new Error("Invalid time string format");
  }
  const date = new Date(timeString);
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "short",
    timeStyle: "short",
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

export const formatCount = (_value, _flag = undefined, _fill = 4) => {
  const value = Number(_value);
  if (value >= 1e6) {
    // For millions, fill-2 digits (accounting for 'm' and one leading zero + decimal)
    const digits = _fill - Math.abs(_value).toString().split(".")[0].length;
    const scaled = value / 1e6;
    const formatted = scaled
      .toFixed(digits >= 0 ? digits : 1)
      .replace(/^0+/, "0");
    return formatted + "m";
  }
  if (value >= 1e3) {
    // For thousands, fill-2 digits (accounting for 'k')
    const digits = _fill - Math.abs(_value).toString().split(".")[0].length;
    const scaled = value / 1e3;
    const formatted = scaled.toFixed(digits >= 0 ? digits : _flag ? 0 : 1);
    return formatted + "k";
  }
  // For regular numbers, use all fill digits
  return value.toFixed(_flag ? 0 : 1);
};

export const formatPrecise = (_value, _decimal = 1) => {
  const value = Number(_value);
  return value
    .toFixed(_decimal)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const emptyConfig = {
  startTime: "-",
  endTime: "-",
  antiLive: 0,
  proLive: 0,
};

export const emptyConfig2 = {
  startTime: "-",
  endTime: "-",
  baryonLive: 0,
  photonLive: 0,
};

export const emptyBags = {
  baryon: [],
  photon: [],
  baryonPool: 0,
  photonPool: 0,
  anti: [],
  pro: [],
  antiPool: 0,
  proPool: 0,
  wallets: [],
};
