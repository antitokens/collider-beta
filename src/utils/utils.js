import React, { useState, useEffect } from "react";
import { toast as toastify } from "react-toastify";
import { BadgeCheck, CircleAlert } from "lucide-react";
import { debounce } from "lodash";
import "react-toastify/dist/ReactToastify.css";

// Convert month abbreviation to number
export const months = {
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

// Convert number to month abbreviation
export const monthsReverse = {
  1: "Jan",
  2: "Feb",
  3: "Mar",
  4: "Apr",
  5: "May",
  6: "Jun",
  7: "Jul",
  8: "Aug",
  9: "Sep",
  10: "Oct",
  11: "Nov",
  12: "Dec",
};

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

export function parseToUTC(timeString, isMobile = false, locale = "en-US") {
  if (!isValidTime(timeString)) {
    throw new Error("Invalid time string format");
  }

  const date = new Date(timeString);

  return new Intl.DateTimeFormat(locale, {
    timeZone: "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
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
  if (useBinning) {
    if (useBinning !== "daily") {
      const [month, day, year, time] = dateStr
        .match(/(\w+)\s+(\d+),\s+(\d+),\s+(\d+):(\d+)/)
        .slice(1);
      const monthIndex = new Date(`${month} 1, 2000`).getMonth();
      const [hours, minutes] = time.split(":");

      return new Date(
        Date.UTC(
          parseInt(year),
          monthIndex,
          parseInt(day),
          parseInt(hours),
          parseInt(minutes || 0)
        )
      ).toISOString();
    }
  }
  return parseCustomDate(dateStr).toISOString();
};

export function parseCustomDate(dateStr) {
  const parts = dateStr.split(", ");
  const hasTime = parts.length > 2;

  const monthDay = parts[0];
  const year = parts[1];
  const time = hasTime ? parts[2] : null;

  const [month, day] = monthDay.split(" ");

  if (hasTime) {
    const [hours, minutes] = time.split(":");

    return new Date(
      Date.UTC(
        parseInt(year),
        months[month],
        parseInt(day),
        parseInt(hours),
        parseInt(minutes)
      )
    );
  }

  return new Date(Date.UTC(parseInt(year), months[month], parseInt(day)));
}

export const shortenTick = (tick, useBinning) => {
  if (useBinning) {
    if (useBinning.endsWith("-hour")) {
      return (
        tick.split(" ").slice(0, 2).join(" ").slice(0, -1) +
        ", " +
        tick.split(" ").slice(-1).join(" ")
      );
    }
    if (useBinning === "daily") {
      return tick.split(" ").slice(0, 2).join(" ").slice(0, -1);
    }
    if (useBinning === "hourly") {
      return tick.split(" ").slice(-1).join(" ");
    }
  }
  return tick;
};

export const dateToLocal = (date, useBinning) => {
  return useBinning !== "daily"
    ? date.toLocaleDateString("en-US", {
        timeZone: "UTC",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: false,
      })
    : date.toLocaleDateString("en-US", {
        timeZone: "UTC",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
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
  if (hourDiff <= 72) return "6-hour";
  if (hourDiff <= 144) return "12-hour";
  return "daily";
}

export const findBinForTimestamp = (timestamp, bins) => {
  // Find the first bin whose date is less than or equal to our timestamp
  return (
    bins.findLast((bin) => {
      return bin <= timestamp;
    }) || bins[0]
  ); // Default to first bin if timestamp is before all bins
};

export const findHourBinForTime = (timestamp, bins) => {
  // Convert timestamp to comparable format
  const [timestampHour, timestampMinute] = timestamp.split(":").map(Number);
  // Find the appropriate bin
  for (let i = 0; i < bins.length - 1; i++) {
    const [currentHour] = bins[i].split(":").map(Number);
    const [nextHour] = bins[i + 1].split(":").map(Number);
    // Handle normal case
    if (timestampHour === currentHour) {
      return bins[i];
    }
    // Handle day wraparound
    if (currentHour > nextHour) {
      // This indicates we're crossing midnight
      if (timestampHour >= currentHour || timestampHour < nextHour) {
        return bins[i];
      }
    }
  }
  // If no bin found, return the first bin
  return bins[0];
};

export const defaultToken = {
  priceUsd: 1.0,
  marketCap: 1e9,
};

export function formatUTCTime(date) {
  const hours = date.getUTCHours().toString().padStart(2, "0");
  const minutes = date.getUTCMinutes().toString().padStart(2, "0");
  const year = date.getUTCFullYear();
  const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  const day = date.getUTCDate().toString().padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes} UTC`;
}

export const TimeTicker = ({
  showSeconds = false,
  className = "",
  fontSize = 12,
  isMobile = true,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [font, setFont] = useState(fontSize);

  useEffect(() => {
    setFont(fontSize);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatUTCDateTime = (date) => {
    // Format date
    const year = date.getUTCFullYear();
    const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
    const day = date.getUTCDate().toString().padStart(2, "0");

    // Format time
    const hours = date.getUTCHours().toString().padStart(2, "0");
    const minutes = date.getUTCMinutes().toString().padStart(2, "0");
    const seconds = date.getUTCSeconds().toString().padStart(2, "0");

    const dateStr = isMobile
      ? `${monthsReverse[Number(month)]} ${day}`
      : `${year} ${monthsReverse[Number(month)]} ${day}`;
    const timeStr = showSeconds
      ? `${hours}:${minutes}:${seconds}`
      : `${hours}:${minutes}`;

    return `${dateStr} ${timeStr}`;
  };

  return (
    <div
      className={`flex items-center bg-transparent rounded-md px-3 py-1 ${className}`}
    >
      <div className="flex items-center space-x-2">
        <span className={`font-mono text-gray-300`}>
          <span className={`text-[${font.toString()}px]`}>
            {formatUTCDateTime(currentTime)}
          </span>
          <span className={`ml-1 text-[11px] text-gray-500`}>UTC</span>
        </span>
      </div>
    </div>
  );
};
