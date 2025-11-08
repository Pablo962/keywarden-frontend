import tailwindcssAnimate from 'tailwindcss-animate'; // <-- 1. IMPORTA el plugin

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // (Aquí pueden ir tus colores/keyframes de shadcn)
    },
  },
  plugins: [
    tailwindcssAnimate // <-- 2. USA la variable importada
  ],
}