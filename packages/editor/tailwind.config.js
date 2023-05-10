/** @type {import('tailwindcss').Config} */
import colors from "@seanchas116/paintkit/colors.js";
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../paintkit/packages/paintkit/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors,
    },
  },
  plugins: [],
};
