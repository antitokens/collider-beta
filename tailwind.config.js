import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx}",
    "./pages/**/*.{html,js,jsx,ts,tsx}",
    "./components/**/*.{html,js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: "#080808",
        "dark-card": "rgba(20, 20, 20, 1)",
        "accent-primary": "#D13800",
        "accent-secondary": "#00CC8E",
        "accent-orange": "#FF4D00",
      },
      fontFamily: {
        grotesk: ["Space Grotesk", "sans-serif"],
        outfit: ["Outfit", "sans-serif"],
        ocr: ["OCR A Std", "monospace"],
        sfmono: ["SF Mono Round", "monospace"],
      },
      typography: {
        DEFAULT: {
          css: {
            code: {
              color: "black",
              backgroundColor: "#d1d5db",
              padding: "2px 6px",
              borderRadius: "4px",
              border: "1px solid #333",
            },
            "code::before": {
              content: "none",
            },
            "code::after": {
              content: "none",
            },
            a: {
              textDecoration: "none",
              color: "#FF4500",
            },
            "blockquote p code": {
              color: "black",
            },
            "a:hover": {
              textDecoration: "underline",
            },
            img: {
              borderRadius: "10px",
              margin: "auto",
              padding: "20px",
              filter: "invert(1)",
            },
          },
        },
      },
    },
  },
  plugins: [typography],
};
