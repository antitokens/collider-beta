import React from "react";
import { AI_MODELS } from "../utils/utils";

// Helper function to determine the text color class
const getTextColor = (truth, value) => {
  if (value === truth) {
    switch (truth) {
      case "Hell Yes":
        return "text-accent-secondary";
      case "Yes":
        return "text-accent-secondary";
      case "Strong Yes":
        return "text-accent-secondary";
      case "Kinda Yes":
        return "text-accent-secondary";
      case "Split":
        return "text-accent-cement";
      case "Kinda No":
        return "text-accent-primary";
      case "Strong No":
        return "text-accent-primary";
      case "No":
        return "text-accent-primary";
      case "Hell No":
        return "text-accent-primary";
      case "Unresolved":
        return "text-blue-400";
      default:
        return "text-gray-300";
    }
  }
  return "text-gray-300";
};

// Reusable Tooltip component
const Tooltip = ({ tooltip, colorClass, translateClass }) => (
  <span
    className={`absolute text-xs tracking-tight p-2 bg-gray-800 rounded-md w-64 ${translateClass} -translate-y-full -mt-6 md:-mt-8 text-center z-10 ${colorClass} hidden group-hover:block font-grotesk`}
  >
    {tooltip}
  </span>
);

// MetadataItem component
const MetadataItem = ({
  label,
  value,
  align = "left",
  className = "",
  tooltip,
  truth,
  onResolutionShow,
  isMobile,
}) => {
  const colorClass = getTextColor(truth, value);

  return (
    <div
      className={`flex items-center space-x-3 ${
        align === "right" ? "justify-end" : "justify-start"
      }`}
    >
      {align === "right" && (
        <div
          className={`px-2 py-1 bg-black bg-opacity-60 rounded text-xs font-mono ${colorClass} hover:bg-opacity-100 transition-colors relative group ${className}`}
        >
          {value}
        </div>
      )}

      <div
        className={`flex flex-row justify-between items-center min-w-16 text-gray-400 text-sm ${
          align === "right" ? "order-last" : "order-first"
        }`}
      >
        {align === "left" && (
          <div className="text-gray-500 text-xs relative group cursor-pointer">
            &nbsp;&#9432;&nbsp;
            <Tooltip
              tooltip={tooltip}
              colorClass={colorClass}
              translateClass="lg:translate-x-0"
            />
          </div>
        )}
        <div className="tracking-tight text-xs">{label}</div>
        {align === "right" && (
          <div className="text-gray-500 text-xs relative group cursor-pointer">
            &#9432;
            <Tooltip
              tooltip={tooltip}
              colorClass={colorClass}
              translateClass="lg:-translate-x-full"
            />
          </div>
        )}
      </div>

      {align === "left" && (
        <div
          className={`px-2 py-1 bg-black bg-opacity-60 rounded text-xs font-mono ${colorClass} hover:bg-opacity-100 transition-colors relative group ${className}`}
        >
          {value}
        </div>
      )}
    </div>
  );
};

// Main Metadata component
const Metadata = ({
  type = "Binary",
  oracle = "Milton AI Agent",
  truth = "Unresolved",
  tellers = AI_MODELS.map(model => model.name).join(', '),
  isMobile = false,
  onResolutionShow,
}) => {
  const tooltips = {
    type: "Prediction outcome is binary",
    oracle: "Autonomous AI agent that aggregates the tellers",
    truth:
      truth === "Hell Yes"
        ? "Final outcome is 100% yes"
        : truth === "Yes"
        ? "Final outcome is convincingly yes"
        : truth === "Strongly Yes"
        ? "Final outcome is strongly yes"
        : truth === "Kinda Yes"
        ? "Final outcome is kinda yes"
        : truth === "Split"
        ? "Final outcome is uncertain"
        : truth === "Kinda No"
        ? "Final outcome is kinda no"
        : truth === "Strongly No"
        ? "Final outcome is strongly no"
        : truth === "No"
        ? "Final outcome is convincingly no"
        : truth === "Hell No"
        ? "Final outcome is 100% no"
        : truth === "Unresolved"
        ? "Final outcome is Unresolved"
        : "Final outcome is Unknown",
    tellers: "AI models that provided truths",
  };

  return (
    <div className="bg-dark-card bg-opacity-50 border border-gray-800 rounded-lg p-4">
      <div
        className={
          isMobile
            ? "flex flex-col items-start"
            : "grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
        }
      >
        <div className={isMobile ? "space-y-1 mb-1" : "space-y-3"}>
          <MetadataItem
            label="Type&nbsp;&nbsp;&nbsp;"
            value={type}
            align="left"
            tooltip={tooltips.type}
            truth={truth}
            onResolutionShow={onResolutionShow}
            isMobile={isMobile}
          />
          <MetadataItem
            label="Oracle&nbsp;"
            value={oracle}
            align="left"
            tooltip={tooltips.oracle}
            truth={truth}
            onResolutionShow={onResolutionShow}
            isMobile={isMobile}
          />
        </div>
        <div className={isMobile ? "space-y-1" : "space-y-3"}>
          <MetadataItem
            label={`Value${isMobile ? "\u00A0\u00A0" : "\u00A0\u00A0\u00A0"}`}
            value={truth}
            align={isMobile ? "left" : "right"}
            tooltip={tooltips.truth}
            truth={truth}
            onResolutionShow={onResolutionShow}
            isMobile={isMobile}
          />
          <MetadataItem
            label="Tellers&nbsp;"
            value={tellers}
            align={isMobile ? "left" : "right"}
            className={isMobile ? "text-left" : "text-right max-w-64"}
            tooltip={tooltips.tellers}
            truth={truth}
            onResolutionShow={onResolutionShow}
            isMobile={isMobile}
          />
        </div>
      </div>
    </div>
  );
};

export default Metadata;
