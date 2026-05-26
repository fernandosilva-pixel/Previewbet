import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#e0522a",
          hover: "#c94420",
        },
        bg: {
          base: "#1a1f2e",
          sidebar: "#131721",
          card: "#242938",
          "card-hover": "#2d3347",
          header: "#0f1320",
          input: "#1e2336",
        },
        odds: {
          bg: "#1e2a3a",
          "bg-hover": "#2a3a50",
          text: "#5ac8fa",
          border: "#2a3a50",
        },
        border: {
          subtle: "#2a2f42",
          active: "#e0522a",
        },
        live: {
          red: "#e53e3e",
        },
        success: {
          green: "#38a169",
        },
        warning: {
          amber: "#d97706",
        },
        info: {
          blue: "#3182ce",
        },
        text: {
          primary: "#ffffff",
          secondary: "#8892a4",
          muted: "#5a647a",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      animation: {
        pulse_live: "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 1.5s infinite",
        "goal-flash": "goalFlash 2s ease-out",
      },
      keyframes: {
        shimmer: {
          from: { backgroundPosition: "-200% 0" },
          to: { backgroundPosition: "200% 0" },
        },
        goalFlash: {
          "0%, 100%": { backgroundColor: "transparent" },
          "50%": { backgroundColor: "rgba(56, 161, 105, 0.3)" },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
