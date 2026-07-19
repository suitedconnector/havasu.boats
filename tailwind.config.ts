import type { Config } from "tailwindcss";

// Design tokens for havasu.boats.
// Palette derived from the subject: turquoise channel water against
// sandbar tan, with rock red as accent. NOT the AI-default cream+serif.
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Deep channel water — primary
        channel: {
          DEFAULT: "#0B4A6F",
          900: "#062E46",
          700: "#0B4A6F",
          500: "#1B6A93",
          300: "#8EBAD1",
          100: "#DDECF3",
        },
        // Sandbar — warm off-white background, NOT AI-cream
        sandbar: {
          DEFAULT: "#EDD9A8",
          50: "#FBF6EA",
          100: "#F5EBD1",
          200: "#EDD9A8",
          300: "#DFC17F",
        },
        // Rock — desert accent
        rock: {
          DEFAULT: "#B93C1E",
          700: "#B93C1E",
          500: "#D2542D",
        },
        // Buoy — signal accent, sparingly
        buoy: "#F4B000",
        // Ink & paper
        ink: "#0C1116",
        paper: "#FBF9F4",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        "chart": "0.14em", // for the coord/eyebrow labels
      },
    },
  },
} satisfies Config;
