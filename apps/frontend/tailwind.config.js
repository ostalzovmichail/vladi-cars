/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui-kit/src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        oswald: ['Oswald', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          DEFAULT: '#c8191a',
          dark: '#a51415',
          light: '#fde8e8',
        },
        page: {
          DEFAULT: '#f5f4f1',
          card: '#ffffff',
        },
        text: {
          primary: '#1a1a1e',
          secondary: '#7a7a82',
        },
        border: {
          DEFAULT: 'rgba(0,0,0,0.10)',
        },
        secondary: {
          DEFAULT: '#eeecea',
        },
      },
    },
  },
  plugins: [],
}
