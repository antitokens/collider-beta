import React from "react";

const Metadata = ({
  type = "Binary",
  oracle = "Milton AI Agent",
  truth = "Unknown",
  tellers = "ChatGPT-o1/o3-mini, Claude Sonnet 3.5, Grok 2",
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
    align = isMobile ? "" : "left",
    className = "",
    tooltip,
  }) => (
    <div
      className={`flex items-center space-x-3 ${
        align === "right" ? "justify-end" : "justify-start"
      }`}
    >
      {align === "right" && (
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
            <span
              className={`absolute text-xs tracking-tight p-2 bg-gray-800 rounded-md w-64 translate-x-0 lg:translate-x-0 -translate-y-full -mt-6 md:-mt-8 text-center z-10 ${
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
        )}
        <div
          className={
            isMobile ? "tracking-tight text-xs" : "tracking-tight text-sm"
          }
        >
          {label}
        </div>
        {align === "right" && (
          <div className="text-gray-500 text-xs relative group cursor-pointer">
            &#9432;
            <span
              className={`absolute text-xs tracking-tight p-2 bg-gray-800 rounded-md w-64 translate-x-0 lg:-translate-x-full -translate-y-full -mt-6 md:-mt-8 text-center z-10 ${
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
        )}
      </div>
      {align === "left" && (
        <>
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
          </div>
        </>
      )}
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
        <div className={isMobile ? `space-y-1 mb-1` : `space-y-3`}>
          <MetadataItem
            label="Type&nbsp;&nbsp;&nbsp;"
            value={type}
            align={"left"}
            tooltip={tooltips.type}
          />
          <MetadataItem
            label="Oracle&nbsp;"
            value={oracle}
            align={"left"}
            tooltip={tooltips.oracle}
          />
        </div>

        <div className={isMobile ? `space-y-1` : `space-y-3`}>
          <MetadataItem
            label={`Value${isMobile ? "\u00A0\u00A0" : "\u00A0\u00A0\u00A0"}`}
            value={truth}
            align={isMobile ? "left" : "right"}
            tooltip={tooltips.truth}
          />
          <MetadataItem
            label="Tellers&nbsp;"
            value={tellers}
            align={isMobile ? "left" : "right"}
            className={isMobile ? "text-left" : "text-right max-w-64"}
            tooltip={tooltips.tellers}
          />
        </div>
      </div>
    </div>
  );
};

export default Metadata;
