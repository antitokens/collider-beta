import { useState, useEffect } from "react";
import { toast as toastify } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BadgeCheck, CircleAlert, Info, TriangleAlert } from "lucide-react";

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
      position: "top-right",
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
      position: "top-right",
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
