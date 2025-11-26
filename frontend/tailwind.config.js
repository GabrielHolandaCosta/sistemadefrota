/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#e0f2ff",
          100: "#b9deff",
          200: "#89c7ff",
          300: "#57b0ff",
          400: "#2f9cff",
          500: "#0588ff",
          600: "#0070e4",
          700: "#0056b2",
          800: "#003d80",
          900: "#00244f"
        }
      }
    }
  },
  plugins: []
};


