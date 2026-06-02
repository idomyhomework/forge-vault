/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#0a0a0c",
        surface2: "#121216",
        card: "#16161c",
        card2: "#1c1c24",
        line: "#2a2a35",
        fore: "#e8e8ee",
        muted: "#8b8b9a",
        acid: "#d4ff3f",
        acid2: "#b8e832",
        crimson: "#ff2e74",
        "blue-acc": "#3fa9ff",
        "orange-acc": "#ff5722",
        "purple-acc": "#9d6bff",
      },
      fontFamily: {
        sans: ["Outfit", "sans-serif"],
        mono: ['"Space Mono"', "monospace"],
        display: ["Anton", "sans-serif"],
      },
    },
  },
  plugins: [],
};
