
/** @type {import("tailwindcss").Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pastelBlue: "#BDE0FE",
        pastelPink: "#FFB5A7",
        pastelGreen: "#9DEB9D",
      }
    },
  },
  plugins: [],
}

