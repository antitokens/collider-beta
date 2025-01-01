import { useState, useEffect } from "react";
import { toast as toastify } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BadgeCheck, CircleAlert } from "lucide-react";
import { calculateCollision } from "./colliderAlpha";

// Metadata init
export const metadataInit = {
  startTime: "-",
  endTime: "-",
  colliderDistribution: {
    u: 0,
    s: 0,
  },
  totalDistribution: {
    u: 0,
    s: 0,
    bags: {
      pro: [],
      anti: [],
      photon: [],
      baryon: [],
    },
    wallets: [],
  },
  emissionsData: {
    total: 0,
    photonTokens: 0,
    baryonTokens: 0,
  },
  collisionsData: {
    total: 1e9,
    proTokens: 0,
    antiTokens: 0,
  },
  eventsOverTime: {
    timestamps: ["", "", "", "", ""],
    events: {
      pro: [],
      anti: [],
      photon: [],
      baryon: [],
    },
    ranges: {
      pro: {
        "0-100k": 0,
        "100k-1m": 0,
        "1-10m": 0,
      },
      anti: {
        "0-100k": 0,
        "100k-1m": 0,
        "1-10m": 0,
      },
      photon: {
        "0-100k": 0,
        "100k-1m": 0,
        "1-10m": 0,
      },
      baryon: {
        "0-100k": 0,
        "100k-1m": 0,
        "1-10m": 0,
      },
    },
    cummulative: {
      pro: [],
      anti: [],
      photon: [],
      baryon: [],
    },
  },
};

// Metadata placeholder
export const metaPlaceholder = metadataInit;

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

export const generateGradientColor = (
  value,
  min,
  max,
  startColor,
  endColor
) => {
  const intensity = (value - min) / (max - min); // Normalize value between 0 and 1
  const [r1, g1, b1] = startColor; // Start RGB color
  const [r2, g2, b2] = endColor; // End RGB color

  // Interpolate each color channel based on intensity
  const r = Math.round(r1 + intensity * (r2 - r1));
  const g = Math.round(g1 + intensity * (g2 - g1));
  const b = Math.round(b1 + intensity * (b2 - b1));

  return `rgb(${r}, ${g}, ${b})`;
};
