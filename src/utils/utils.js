import { useState, useEffect } from "react";
import { toast as toastify } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BadgeCheck, CircleAlert, Info, TriangleAlert } from "lucide-react";

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

// Base configuration for ToastContainer
export const toastContainerConfig = {
  position: "top-left",
  autoClose: 3000,
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
      style: {
        background: "black",
        color: "#00CC8E",
        fontFamily: "SF Mono Round",
        fontSize: "18px",
        border: "2px solid #00CC8E",
      },
      progressStyle: {
        background: "#00CC8E",
      },
      icon: <BadgeCheck className="stroke-accent-secondary" />,
    });
  },

  error: (message) => {
    toastify(message, {
      style: {
        background: "black",
        color: "#D13800",
        fontFamily: "SF Mono Round",
        fontSize: "18px",
        border: "2px solid #D13800",
      },
      progressStyle: {
        background: "#D13800",
      },
      icon: <CircleAlert className="stroke-accent-primary" />,
    });
  },
};
