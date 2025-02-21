import React from "react";
import { resolutionsInit, capitalise, capitaliseJoin } from "../utils/utils";

export const Resolution = ({
  isVisible,
  setIsVisible,
  resolutions = resolutionsInit,
  isMobile,
}) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const resolutionKeys = Object.keys(resolutions);
  const currentResolutionKey = resolutionKeys[currentIndex];

  const handleOutsideClick = (event) => {
    if (event.target.id === "modal-background") {
      setIsVisible(false);
    }
  };

  const goForward = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === resolutionKeys.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goBackward = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? resolutionKeys.length - 1 : prevIndex - 1
    );
  };

  return (
    <>
      {isVisible && (
        <div
          id="modal-background"
          className="fixed inset-0 bg-black bg-opacity-85 flex justify-center items-center z-50 w-full"
          onClick={handleOutsideClick}
        >
          <div className="relative bg-dark-card backdrop-blur-xl p-8 rounded-lg border border-gray-800/50 max-w-4xl w-full mx-4 sm:mx-6 md:mx-8 h-min-full">
            <div className="absolute top-3 right-3 flex space-x-2">
              <button
                id="close-modal"
                className="text-gray-300 hover:text-accent-primary ml-2"
                onClick={() => setIsVisible(false)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="w-full flex flex-row justify-between items-center">
              <div>
                <h3 className="text-4xl font-bold text-accent-steel mb-2 mt-14 ml-9">
                  Milton AI
                </h3>
                <div className="text-gray-300 mb-6 ml-9 font-sfmono text-2xl">
                  <span className="text-gray-500 mb-6 font-ocr tracking-tight">
                    Model:
                  </span>{" "}
                  {currentResolutionKey}
                  <span className="text-gray-500 mb-6 ml-3 font-sfmono text-lg">
                    ({currentIndex + 1}/{resolutionKeys.length})
                  </span>
                </div>
              </div>
              <div>
                <button
                  className="text-gray-300 hover:text-accent-primary mr-3"
                  onClick={goBackward}
                  aria-label="Previous resolution"
                >
                  <i className="fa-solid fa-square-caret-left text-accent-primary text-3xl"></i>
                </button>
                <button
                  className="text-gray-300 hover:text-accent-primary ml-3 mr-10"
                  onClick={goForward}
                  aria-label="Next resolution"
                >
                  <i className="fa-solid fa-square-caret-right text-accent-secondary text-3xl"></i>
                </button>
              </div>
            </div>

            {/* Scrollable content container */}
            <div className="overflow-y-auto max-h-[70vh]">
              <PrettySchema
                jsonData={resolutions[currentResolutionKey]}
                isMobile={isMobile}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const Section = ({ key, title, data, isMobile }) => {
  return (
    <div className="mb-3 p-2">
      <h2 className="text-md font-ocr tracking-tight mb-1 capitalize text-accent-steel">
        {"⦿ " + addSpaces(title)}
      </h2>
      <div className="space-y-1">
        {typeof data === "object" && data !== null ? (
          Object.entries(data).map(([key, value]) => (
            <div key={key} className="flex">
              <span
                className={`${
                  isMobile ? "w-28" : "w-40"
                } font-ocr capitalize text-xs tracking-tight text-gray-400`}
              >
                {addSpaces(key)}:
              </span>
              <span
                className={`flex-1 font-mono text-xs bg-black rounded-sm py-[2px] px-2 ${
                  key === "probability" || key === "level"
                    ? "text-green-400"
                    : key === "question"
                    ? "text-accent-cement"
                    : "text-gray-400"
                }`}
              >
                {Array.isArray(value)
                  ? capitaliseJoin(value, ". ")
                  : key === "probability" && value
                  ? String(value) + "%"
                  : value
                  ? capitalise(String(value))
                  : "NOT_AVAILABLE"}
              </span>
            </div>
          ))
        ) : (
          <p className="font-mono text-xs bg-black rounded-sm py-[4px] px-2 text-accent-cement">
            {data ? capitalise(String(data)) : "NOT_AVAILABLE"}
          </p>
        )}
      </div>
    </div>
  );
};

export const PrettySchema = ({ jsonData, isMobile }) => {
  return (
    <div
      className={`w-full mx-auto ${
        isMobile ? "px-4" : "px-8"
      } pb-12 space-y-3 bg-dark-card-600 rounded-md`}
    >
      {Object.entries(jsonData).map(
        ([section, content]) =>
          !["error", "apiError", "rawResponse"].includes(section) && (
            <Section
              key={section}
              title={section}
              data={content}
              isMobile={isMobile}
            />
          )
      )}
    </div>
  );
};

function addSpaces(str) {
  return str.replace(/([a-z])([A-Z])/g, "$1 $2");
}
