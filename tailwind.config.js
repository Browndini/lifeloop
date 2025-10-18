/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}", "./app-example/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sand: {
          50: "#f9f6f2",
          100: "#f3ece4",
          200: "#e8dbcf",
          300: "#ddcab9",
          400: "#d2baa4",
          500: "#c7aa8f",
          600: "#b08c6f",
          700: "#966f51",
          800: "#7b5233",
          900: "#603416",
        },
      },
      fontFamily: {
        display: ["PlusJakartaSans_600SemiBold", "System"],
        body: ["PlusJakartaSans_400Regular", "System"],
      },
    },
  },
  plugins: [],
};
