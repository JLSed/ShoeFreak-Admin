/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        outfit: ["Outfit"],
        poppins: ["Poppins"],
        monstserrat: ["Montserrat"],
        gochi_hand: ["Gochi Hand"],
        rock_salt: ["Rock Salt"],
      },
    },
  },
  plugins: [],
};
