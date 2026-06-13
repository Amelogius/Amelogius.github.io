import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "#0B0F19",
        surface: "#0F1525",
        neon: {
          DEFAULT: "#00F0FF",
          dim: "#00c2cc",
        },
        violet: {
          DEFAULT: "#8A2BE2",
          dim: "#6f1fc0",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        neon: "0 0 20px rgba(0, 240, 255, 0.25)",
        violet: "0 0 24px rgba(138, 43, 226, 0.35)",
      },
      backgroundImage: {
        "neon-grad": "linear-gradient(135deg, #00F0FF 0%, #8A2BE2 100%)",
      },
      keyframes: {
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.7" },
          "70%": { transform: "scale(1.6)", opacity: "0" },
          "100%": { opacity: "0" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        pop: {
          "0%": { transform: "scale(1)" },
          "40%": { transform: "scale(1.35)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        "pulse-ring": "pulse-ring 1.2s cubic-bezier(0.215,0.61,0.355,1) infinite",
        "fade-up": "fade-up 0.35s ease-out both",
        shimmer: "shimmer 1.4s linear infinite",
        pop: "pop 0.3s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
