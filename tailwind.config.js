/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: '#205781',
        'brand-secondary': '#4F959D',
      },
    },
  },
  plugins: [],
};
