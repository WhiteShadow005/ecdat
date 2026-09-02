import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#050811",
          900: "#0a0f1e",
          850: "#0d1527",
          800: "#0f172a",
          750: "#162038",
          700: "#1e293b",
          600: "#334155",
          500: "#475569",
        },
        cyber: {
          red: "#ef4444",
          "red-glow": "#ef444433",
          yellow: "#eab308",
          "yellow-glow": "#eab30833",
          green: "#10b981",
          "green-glow": "#10b98133",
          cyan: "#06b6d4",
          "cyan-glow": "#06b6d433",
          purple: "#a855f7",
          "purple-glow": "#a855f733",
          blue: "#3b82f6",
        },
      },
      fontFamily: {
        mono: [
          "JetBrains Mono",
          "Fira Code",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      boxShadow: {
        "cyber-red": "0 0 20px -5px rgba(239, 68, 68, 0.4)",
        "cyber-yellow": "0 0 20px -5px rgba(234, 179, 8, 0.4)",
        "cyber-green": "0 0 20px -5px rgba(16, 185, 129, 0.4)",
        "cyber-cyan": "0 0 20px -5px rgba(6, 182, 212, 0.4)",
        "cyber-purple": "0 0 20px -5px rgba(168, 85, 247, 0.4)",
      },
      animation: {
        pulse_fast: "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "radar-sweep": "radar 4s linear infinite",
      },
      keyframes: {
        radar: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
