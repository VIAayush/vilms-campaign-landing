import type { Config } from "tailwindcss";

// VILMS brand system — evergreen + cream + marigold, matching the product
// brochure and the VILMS app's own design tokens.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        ink: {
          DEFAULT: "#0A2E25", // deep VILMS green — dark surfaces
          900: "#072219",
          800: "#0A2E25",
          700: "#14483A",
          600: "#1D5B49",
          500: "#2A6E59",
          100: "#DCEAE3",
          50: "#EEF5F1",
        },
        brass: {
          DEFAULT: "#E8A33D", // marigold — the call to action
          600: "#D18C26",
          soft: "#EFBB6B",
          tint: "#FBF1DE",
          text: "#8A6520",
        },
        paper: { DEFAULT: "#F6F5F0", 2: "#F1EFE8" },
        surface: { DEFAULT: "#FFFFFF", 2: "#FBFAF6" },
        line: { DEFAULT: "#E7E4DB", strong: "#DDD9CE" },
        body: "#1D2A26",
        muted: "#5F6B66",
        faint: "#98A19C",
        ok: { DEFAULT: "#2E7D5B", bg: "#E4F0EA" },
        warn: { DEFAULT: "#B0833A", bg: "#F7EBD6" },
        err: { DEFAULT: "#B23B3B", bg: "#F7E5E3" },
        info: { DEFAULT: "#33628C", bg: "#E6EDF4" },
        ai: { DEFAULT: "#6B4FA0", bg: "#EEE9F6" },

        // ---- Public site (2026 redesign). The CRM keeps the tokens above. ----
        night: { DEFAULT: "#070B1A", 2: "#0C1229", 3: "#131B3B", 4: "#1C2650" },
        iris: { DEFAULT: "#5B5BF6", 600: "#4B4BE0", 400: "#8183FF", 300: "#A9ABFF", 100: "#E4E5FF", 50: "#F1F1FF" },
        violet: { DEFAULT: "#8B5CF6", 300: "#C4B5FD" },
        aqua: { DEFAULT: "#22D3EE", 600: "#0AAFC9", 300: "#7DEBF8", 50: "#E8FBFE" },
        sun: { DEFAULT: "#FFB547", 600: "#FF9F1C", 50: "#FFF6E6" },
        snow: { DEFAULT: "#F6F7FB", 2: "#EEF0F7" },
      },
      boxShadow: {
        card: "0 1px 3px rgba(10,46,37,.06)",
        lift: "0 12px 32px -8px rgba(10,46,37,.16)",
        float: "0 24px 60px -16px rgba(10,46,37,.35)",
      },
      borderRadius: { xl2: "1.25rem" },
      keyframes: {
        "aurora-a": { "0%": { transform: "translate(0,0) scale(1)" }, "100%": { transform: "translate(-60px,50px) scale(1.12)" } },
        "aurora-b": { "0%": { transform: "translate(0,0) scale(1)" }, "100%": { transform: "translate(50px,-40px) scale(1.08)" } },
        "float-y": { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-6px)" } },
        "dash-flow": { to: { strokeDashoffset: "-24" } },
        "fade-up": { from: { opacity: "0", transform: "translateY(10px)" }, to: { opacity: "1", transform: "none" } },
        "drift-a": { "0%": { transform: "translate3d(0,0,0) scale(1)" }, "100%": { transform: "translate3d(-8%,6%,0) scale(1.15)" } },
        "drift-b": { "0%": { transform: "translate3d(0,0,0) scale(1.1)" }, "100%": { transform: "translate3d(9%,-7%,0) scale(0.95)" } },
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
      },
      animation: {
        "aurora-a": "aurora-a 26s ease-in-out infinite alternate",
        "aurora-b": "aurora-b 32s ease-in-out infinite alternate",
        "float-y": "float-y 6s ease-in-out infinite",
        "dash-flow": "dash-flow 1.6s linear infinite",
        "fade-up": "fade-up .35s ease-out both",
        "drift-a": "drift-a 22s ease-in-out infinite alternate",
        "drift-b": "drift-b 28s ease-in-out infinite alternate",
        "float-slow": "float-y 7s ease-in-out infinite",
        marquee: "marquee 40s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
