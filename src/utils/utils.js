import { useState, useEffect } from "react";
import { toast as toastify } from "react-toastify";
import { BadgeCheck, CircleAlert } from "lucide-react";
import { debounce } from "lodash";
import "react-toastify/dist/ReactToastify.css";

export function parseCustomDate(dateStr) {
  // Check if date includes time
  const parts = dateStr.split(", ");
  const hasTime = parts.length > 2;

  const monthDay = parts[0];
  const year = parts[1];
  const time = hasTime ? parts[2] : null;

  const [month, day] = monthDay.split(" ");

  // Convert month abbreviation to number
  const months = {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    May: 4,
    Jun: 5,
    Jul: 6,
    Aug: 7,
    Sep: 8,
    Oct: 9,
    Nov: 10,
    Dec: 11,
  };

  if (hasTime) {
    // Parse time if present
    const [hour, period] = time.split(" ");

    // Convert hour to 24-hour format
    let hour24 = parseInt(hour);
    if (period === "PM" && hour24 !== 12) hour24 += 12;
    if (period === "AM" && hour24 === 12) hour24 = 0;

    return new Date(parseInt(year), months[month], parseInt(day), hour24);
  }

  // Return date without time
  return new Date(parseInt(year), months[month], parseInt(day));
}

/* Global Constants */

// Metadata init
export const metadataInit = {
  startTime: "-",
  endTime: "-",
  colliderDistribution: {
    u: 0,
    s: 0,
    range: [],
    distribution: [],
    short: [],
    curve: [],
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
    cumulative: {
      timestamps: [],
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
    console.log(_fill)
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
  if (min === 0 && max === 0) {
    return `rgba(0, 0, 0, 0)`;
  }
  if (min === max) {
    return `rgba(128, 128, 128, 1)`;
  }
  const intensity = (value - min) / (max - min); // Normalize value between 0 and 1
  const [r1, g1, b1, a1] = startColor; // Start RGB color
  const [r2, g2, b2, a2] = endColor; // End RGB color

  // Interpolate each color channel based on intensity
  const r = Math.round(r1 + intensity * (r2 - r1));
  const g = Math.round(g1 + intensity * (g2 - g1));
  const b = Math.round(b1 + intensity * (b2 - b1));
  const a = Math.round(a1 + intensity * (a2 - a1));

  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

export const parseDateToISO = (dateStr, useBinning) => {
  const local = new Date();
  if (useBinning) {
    if (useBinning !== "daily") {
      const [month, day, year, time] = dateStr
        .match(/(\w+)\s+(\d+),\s+(\d+),\s+(\d+\s+[AP]M)/)
        .slice(1);
      const monthIndex = new Date(`${month} 1, 2000`).getMonth(); // Get month index (0-11)
      const [hours, period] = time.split(/\s+/);
      const hour12 = hours % 12 || 12;
      // Reconstruct date in local timezone
      const hour24 =
        period === "PM" && hour12 !== 12
          ? hour12 + 12
          : period === "AM" && hour12 === 12
          ? 0
          : hour12;
      // Create new date with local components
      const date = new Date(year, monthIndex, day, hour24);
      // Convert to ISO string
      const localDate = new Date(
        date.getTime() - local.getTimezoneOffset() * 60000
      );
      return localDate.toISOString();
    }
  }
  // For non-hourly format, convert UTC to local time before creating ISO string
  const date = parseCustomDate(dateStr);
  const localDate = new Date(
    date.getTime() - local.getTimezoneOffset() * 60000
  );
  return localDate.toISOString();
};

export const shortenTick = (tick, useBinning) => {
  if (useBinning) {
    if (useBinning.endsWith("-hour")) {
      return (
        tick.split(" ").slice(0, 2).join(" ").slice(0, -1) +
        ", " +
        tick.split(" ").slice(-2).join(" ")
      );
    }
    if (useBinning === "daily") {
      return tick.split(" ").slice(0, 2).join(" ").slice(0, -1);
    }
    if (useBinning === "hourly") {
      return tick.split(" ").slice(-2).join(" ");
    }
  }
  return tick;
};

export const copyText = debounce(async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("CA copied to clipboard!");
  } catch (err) {
    console.error("Failed to copy text: ", err);
    toast.error("Failed to copy");
  }
}, 300);

export function detectBinningStrategy(dates) {
  if (dates.length < 2) return "unknown";
  const schedule = dates.slice(0, 2);
  const date1 = new Date(schedule[0]);
  const date2 = new Date(schedule[1]);
  const hourDiff = (date2 - date1) / (1000 * 60 * 60);
  if (hourDiff <= 24) return "hourly";
  if (hourDiff <= 48) return "6-hour";
  if (hourDiff <= 144) return "12-hour";
  return "daily";
}

export const defaultToken = {
  priceUsd: 1.0,
  marketCap: 1e9,
};
