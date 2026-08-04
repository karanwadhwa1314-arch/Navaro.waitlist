/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navaro: {
          cream: '#FDFBF0',
          accent: '#FCE883',
          'accent-soft': '#FDF2B3',
          forest: '#004D40',
          ink: '#002D2D',
          purple: '#7C6AE8',
          'purple-cta': '#9D59D1',
          teal: '#0f766e',
          panel: '#FAF7EE',
        },
        primary: {
          50: '#f0f8ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#60c5fa',
          500: '#3b9ef5',
          600: '#2b8ce8',
          700: '#1e7cd4',
          800: '#1a6bb0',
          900: '#1a5a91',
        },
      },
    },
  },
  plugins: [],
}

