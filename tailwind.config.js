/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'pretendard': ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Roboto', 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'sans-serif'],
      },
      colors: {
        'toss': {
          'blue': '#3182f6',
          'blue-hover': '#1b64da',
          'gray': {
            900: '#191f28',
            800: '#333d4b',
            700: '#4e5968',
            600: '#6b7684',
            500: '#8b95a1',
            400: '#b0b8c1',
            300: '#c9cfd8',
            200: '#e5e8eb',
            100: '#f2f4f6',
            50: '#f9fafb',
          },
          'gold': '#ffa726',
          'green': '#00c851',
          'red': '#ff6b6b',
        }
      },
      animation: {
        'mining': 'mining 2s ease-in-out infinite',
        'coin-drop': 'coin-drop 0.8s ease-out',
      },
      keyframes: {
        mining: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
        'coin-drop': {
          '0%': { transform: 'translateY(-100px) rotate(0deg)', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { transform: 'translateY(0) rotate(360deg)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

