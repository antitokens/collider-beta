const BuyTokenModal = ({ isVisible, setIsVisible }) => {
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
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          onClick={handleOutsideClick}
        >
          <div className="relative bg-dark-card/60 backdrop-blur-xl p-8 rounded-lg border border-gray-800/50 max-w-md w-full mx-4 sm:mx-6 md:mx-8">
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

            <h3 className="text-2xl font-bold text-gray-300 mb-4">
              Buy Tokens
            </h3>
            <p className="text-gray-400 mb-6">Choose a token to purchase:</p>
            <div className="space-y-4">
              <a
                target="_blank"
                href="https://raydium.io/swap/?inputMint=sol&outputMint=HB8KrN7Bb3iLWUPsozp67kS4gxtbA4W5QJX4wKPvpump"
                className="block text-center bg-accent-primary hover:bg-accent-primary/90 text-white px-6 py-3 rounded-lg"
              >
                Buy <span className="font-bold text-lg">$ANTI</span> Token
              </a>
              <a
                target="_blank"
                href="https://raydium.io/swap/?inputMint=sol&outputMint=CWFa2nxUMf5d1WwKtG9FS9kjUKGwKXWSjH8hFdWspump"
                className="block text-center bg-accent-secondary/90 hover:bg-accent-secondary/80 text-white px-6 py-3 rounded-lg"
              >
                Buy <span className="font-bold text-lg">$PRO</span> Token
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BuyTokenModal;
