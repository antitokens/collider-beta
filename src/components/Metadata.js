import React from "react";

const Metadata = ({
  type = "Binary",
  oracle = "Milton AI Agent",
  truth = "Unknown",
  tellers = "ChatGPT-o1, Claude Sonnet 3.5, Grok 2",
  isMobile = false,
}) => {
  const tooltips = {
    type: "Prediction outcome is binary",
    oracle: "Autonomous AI agent that aggregates the tellers",
    truth:
      truth === "Unknown"
        ? "Final outcome is not yet known"
        : truth === "Yes"
        ? "Final outcome is Yes"
        : "Final outcome is No",
    tellers: "AI models that provided truths",
  };

  const MetadataItem = ({
    label,
    value,
    align = "left",
    className = "",
    tooltip,
  }) => (
    <div
      className={`flex items-center space-x-3 ${
        align === "right" ? "justify-end" : ""
      }`}
    >
      <div
        className={`px-2 py-1 bg-black bg-opacity-60 rounded text-xs font-mono ${
          truth === "Yes" && value === truth
            ? "text-accent-secondary"
            : truth === "No" && value === truth
            ? "text-accent-primary"
            : "text-gray-300"
        } hover:bg-opacity-100 transition-colors relative group cursor-pointer ${className}`}
      >
        {value}
        <span
          className={`absolute text-sm p-2 bg-gray-800 rounded-md w-64 translate-x-0 lg:-translate-x-1/2 -translate-y-full -mt-6 md:-mt-8 text-center ${
            truth === "Yes" && value === truth
              ? "text-accent-secondary"
              : truth === "No" && value === truth
              ? "text-accent-primary"
              : "text-gray-300"
          } hidden group-hover:block font-grotesk`}
        >
          {tooltip}
        </span>
      </div>
      <div
        className={`min-w-20 text-gray-400 text-sm ${
          align === "right" ? "" : "order-first"
        }`}
      >
        {label}
      </div>
    </div>
  );

  return (
    <div className="bg-dark-card bg-opacity-50 border border-gray-800 rounded-lg p-4">
      <div
        className={
          isMobile
            ? `flex flex-col items-start`
            : `grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6`
        }
      >
        <div className={isMobile ? `space-y-1` : `space-y-3`}>
          <MetadataItem label="Type" value={type} tooltip={tooltips.type} />
          <MetadataItem
            label="Oracle"
            value={oracle}
            tooltip={tooltips.oracle}
          />
        </div>

        <div className={isMobile ? `space-y-1` : `space-y-3`}>
          <MetadataItem
            label="Truth"
            value={truth}
            align={isMobile ? "" : "right"}
            tooltip={tooltips.truth}
          />
          <MetadataItem
            label="Tellers"
            value={tellers}
            align={isMobile ? "" : "right"}
            className={isMobile ? "text-left" : "text-right max-w-64"}
            tooltip={tooltips.tellers}
          />
        </div>
      </div>
    </div>
  );
};

export default Metadata;
