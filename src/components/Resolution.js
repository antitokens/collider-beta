import React from "react";

export const Resolution = ({
  isVisible,
  setIsVisible,
  resolution,
  isMobile,
}) => {
  const handleOutsideClick = (event) => {
    if (event.target.id === "modal-background") {
      setIsVisible(false);
    }
  };

  return (
    <>
      {isVisible && (
        <div
          id="modal-background"
          className="fixed inset-0 bg-black bg-opacity-85 flex justify-center items-center z-50 w-full"
          onClick={handleOutsideClick}
        >
          <div className="relative bg-dark-card backdrop-blur-xl p-4 rounded-lg border border-gray-800/50 max-w-4xl w-full mx-4 sm:mx-6 md:mx-8">
            <button
              id="close-modal"
              className="absolute top-3 right-3 text-gray-300 hover:text-accent-primary"
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

            <h3 className="text-xl font-bold text-gray-300 mb-8 mt-8 text-center">
              Milton AI:
            </h3>
            {/* Scrollable content container */}
            <div className="overflow-y-auto max-h-[70vh]">
              <PrettySchema
                jsonData={JSON.parse(resolution)}
                isMobile={isMobile}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const Section = ({ title, data, isMobile }) => {
  return (
    <div className="mb-3 p-2">
      <h2 className="text-md font-mono mb-1 capitalize text-accent-steel">
        {addSpaces(title)}
      </h2>
      <div className="space-y-1">
        {typeof data === "object" && data !== null ? (
          Object.entries(data).map(([key, value]) => (
            <div key={key} className="flex">
              <span
                className={`${
                  isMobile ? "w-28" : "w-40"
                } font-mono capitalize text-xs text-gray-400`}
              >
                {addSpaces(key)}:
              </span>
              <span className="flex-1 font-mono text-xs bg-black rounded-sm py-[2px] px-2">
                {Array.isArray(value) ? value.join(", ") : String(value)}
              </span>
            </div>
          ))
        ) : (
          <p className="font-mono text-xs bg-black rounded-sm py-[4px] px-2">
            {String(data)}
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
      {Object.entries(jsonData).map(([section, content]) => (
        <Section
          key={section}
          title={section}
          data={content}
          isMobile={isMobile}
        />
      ))}
    </div>
  );
};

function addSpaces(str) {
  return str.replace(/([a-z])([A-Z])/g, "$1 $2");
}
