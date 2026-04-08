import { defineConfig } from "@pandacss/dev"

export default defineConfig({
  preflight: false,
  include: ["./src/**/*.{ts,tsx}"],
  exclude: [],
  outdir: "styled-system",
  jsxFramework: "react",

  conditions: {
    extend: {
      desktop: "@media (min-width: 768px)",
      canHover: "@media (hover: hover)",
    },
  },

  theme: {
    extend: {
      tokens: {
        colors: {
          background: { value: "#000" },
          foreground: { value: "#fff" },
          "text-secondary": { value: "#adadad" },
          "text-muted": { value: "rgba(255, 255, 255, 0.5)" },
          "text-dim": { value: "rgba(255, 255, 255, 0.7)" },
          "border-subtle": { value: "rgba(255, 255, 255, 0.15)" },
          success: { value: "#14b861" },
          gold: { value: "#ffe103" },
        },
        spacing: {
          cp: { value: "30px" },
        },
        fonts: {
          sans: {
            value:
              "var(--font-suisse), var(--font-inter), -apple-system, system-ui, sans-serif",
          },
        },
      },
      keyframes: {
        ripple20: {
          "0%": { transform: "scale(1)", opacity: "0.5" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
        rainbowShift: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
        placeholderShimmer: {
          "0%": { backgroundPosition: "150% center" },
          "100%": { backgroundPosition: "-50% center" },
        },
        numSlideOut: {
          "0%": { transform: "translateY(0)", filter: "blur(0)", opacity: "1" },
          "100%": { transform: "translateY(22%)", filter: "blur(4px)", opacity: "0" },
        },
        numSlideIn: {
          "0%": { transform: "translateY(-22%)", filter: "blur(4px)", opacity: "0" },
          "100%": { transform: "translateY(0)", filter: "blur(0)", opacity: "1" },
        },
        descFadeIn: {
          "0%": { transform: "translateY(-8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        springRight: {
          "0%": { transform: "translateX(-8px)" },
          "18%": { transform: "translateX(5px)" },
          "32%": { transform: "translateX(-3.5px)" },
          "46%": { transform: "translateX(2.5px)" },
          "58%": { transform: "translateX(-1.5px)" },
          "70%": { transform: "translateX(1px)" },
          "82%": { transform: "translateX(-0.4px)" },
          "100%": { transform: "translateX(0)" },
        },
        rgbSplit: {
          "0%": { textShadow: "none" },
          "3%": { textShadow: "-6px 1px rgba(255,0,0,0.9), 6px -1px rgba(0,80,255,0.9)" },
          "7%": { textShadow: "8px -1.5px rgba(255,0,0,0.95), -3px 1px rgba(0,255,60,0.7), -7px 0.5px rgba(0,80,255,0.95)" },
          "12%": { textShadow: "-9px 1px rgba(255,0,0,1), 4px -1px rgba(0,255,60,0.6), 8px 1.5px rgba(0,80,255,0.95)" },
          "16%": { textShadow: "7px 1.5px rgba(255,0,0,0.9), -6px -1px rgba(0,80,255,0.9)" },
          "21%": { textShadow: "-5px -1px rgba(255,0,0,0.8), 2.5px 0.5px rgba(0,255,60,0.5), 5px -0.5px rgba(0,80,255,0.8)" },
          "28%": { textShadow: "4px 0.5px rgba(255,0,0,0.65), -3.5px 0 rgba(0,80,255,0.65)" },
          "38%": { textShadow: "-2.5px 0 rgba(255,0,0,0.4), 1.5px 0 rgba(0,255,60,0.2), 2.5px 0 rgba(0,80,255,0.4)" },
          "52%": { textShadow: "1.2px 0 rgba(255,0,0,0.2), -1.2px 0 rgba(0,80,255,0.2)" },
          "70%": { textShadow: "-0.5px 0 rgba(255,0,0,0.06), 0.5px 0 rgba(0,80,255,0.06)" },
          "100%": { textShadow: "none" },
        },
        nameShimmer: {
          "0%": { backgroundPosition: "150% center" },
          "100%": { backgroundPosition: "-50% center" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        cellReveal: {
          "0%": { opacity: "0", transform: "scale(0.7) rotate(-4deg)" },
          "60%": { opacity: "1", transform: "scale(1.04) rotate(1deg)" },
          "100%": { opacity: "1", transform: "scale(1) rotate(0deg)" },
        },
        fadeInRing: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },

  globalCss: {
    "*": { boxSizing: "border-box", margin: "0", padding: "0" },
    "html, body": {
      height: "100%",
      overflow: "hidden",
      background: "#000",
      overscrollBehavior: "none",
    },
    body: {
      opacity: "0",
      transition: "opacity 0.15s ease",
      fontWeight: "500",
      WebkitFontSmoothing: "antialiased",
      MozOsxFontSmoothing: "grayscale",
      userSelect: "none",
    },
    "body.fonts-ready": { opacity: "1" },
  },
})
