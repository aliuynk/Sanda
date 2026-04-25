/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('nativewind/preset'), require('@sanda/config-tailwind')],
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
};
