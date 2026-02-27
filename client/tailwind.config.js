/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["Space Grotesk", "system-ui", "sans-serif"],
      },
      colors: {
        ink: "#1a1a1a",
        sand: "#f6f2ec",
        accent: "#ff6b4a",
        navy: "#1f2a44",
        sage: "#d8e2cf",
      },
      boxShadow: {
        soft: "0 22px 60px rgba(31, 42, 68, 0.12)",
      },
    },
  },
  plugins: [],
};
