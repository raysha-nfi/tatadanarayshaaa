/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f6f8f2',
          100: '#ecf1e3',
          200: '#dce5cc',
          300: '#c8d7af',
          400: '#b7c997',
          500: '#afc28a', // Warna Sage Green (#afc28a)
          600: '#95a870',
          700: '#758752',
          800: '#56643c',
          900: '#3c4629',
          DEFAULT: '#afc28a',
        },
        sage: {
          50: '#f6f8f2',
          100: '#ecf1e3',
          200: '#dce5cc',
          300: '#c8d7af',
          400: '#b7c997',
          500: '#afc28a', // Warna Sage Green (#afc28a)
          600: '#95a870',
          700: '#758752',
          800: '#56643c',
          900: '#3c4629',
          DEFAULT: '#afc28a',
        },
        blush: {
          50: '#fff8f9',
          100: '#feedf0',
          200: '#fddfe3',
          300: '#fdcfd4', // Warna Soft Blush Pink (#fdcfd4)
          400: '#fbaab4',
          500: '#f48190',
          600: '#df566a',
          700: '#be364b',
          800: '#9c2d3e',
          900: '#7d2633',
          DEFAULT: '#fdcfd4',
        },
        // Map orange classes to pastel blush pink and sage green
        orange: {
          50: '#fff8f9',
          100: '#feedf0',
          200: '#fddfe3',
          300: '#fdcfd4',
          400: '#fbaab4',
          500: '#afc28a',
          600: '#8e9f6b',
          700: '#707f51',
          800: '#535e3c',
          900: '#394129',
        },
        dark: {
          bg: '#182014',
          card: '#202a1b',
          surface: '#2a3724',
          border: '#394b31',
          text: '#ffffff',
          muted: '#a3b593',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
