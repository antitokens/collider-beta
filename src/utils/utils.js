import { useState, useEffect } from "react";

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      // Check if the device width is less than or equal to 768px
      setIsMobile(window.innerWidth <= 768);
    };

    // Add event listener for resize
    window.addEventListener("resize", handleResize);

    // Run the check on component mount
    handleResize();

    // Cleanup event listener on unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
};
