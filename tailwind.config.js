/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cocoa: {
          DEFAULT: '#3D2C2E',
          light: '#5C4033',
          dark: '#2D1E1E',
        },
        cream: {
          DEFAULT: '#FDF8F5',
          pill: '#FFFDF9',
          warm: '#FAF0E6',
        },
        honey: {
          DEFAULT: '#C88A55',
          light: '#D9A066',
        },
        sage: {
          DEFAULT: '#A7C4B5',
          dark: '#6E9A84',
        },
      },
      fontFamily: {
        sans: ['"Nunito"', '"Quicksand"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
