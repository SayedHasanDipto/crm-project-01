import type { Config } from "tailwindcss";
const { heroui } = require("@heroui/react");

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-syne)", "system-ui", "sans-serif"],
        mono: ["var(--font-dm-mono)", "monospace"]
      }
    }
  },
  darkMode: "class",
  plugins: [
    require("daisyui"),
    heroui({
      themes: {
        dark: {
          colors: {
            primary: { DEFAULT: "#e8a020", foreground: "#0e0f0f" },
            secondary: { DEFAULT: "#4a8fd4", foreground: "#fff" },
            danger: { DEFAULT: "#d94f4f", foreground: "#fff" },
            success: { DEFAULT: "#4caf7d", foreground: "#fff" }
          }
        }
      }
    })
  ],
  daisyui: {
    themes: [
      {
        dark: {
          "color-scheme": "dark",
          "primary": "#e8a020",
          "secondary": "#4a8fd4",
          "accent": "#4caf7d",
          "neutral": "#1e2020",
          "base-100": "#0e0f0f",
          "base-200": "#161717",
          "base-300": "#1e2020",
          "base-content": "#f0efea",
          "info": "#4a8fd4",
          "success": "#4caf7d",
          "warning": "#e8a020",
          "error": "#d94f4f"
        }
      }
    ],
    darkTheme: "dark",
    base: true,
    styled: true,
    utils: true
  }
};

export default config;
