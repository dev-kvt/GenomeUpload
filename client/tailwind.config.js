/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          700: '#0f172a',
          600: '#1f2937'
        },
        mist: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5f5'
        },
        tealish: {
          500: '#0ea5a4',
          600: '#0b8f8f'
        }
      },
      boxShadow: {
        soft: '0 12px 40px -24px rgba(15, 23, 42, 0.45)'
      }
    }
  },
  plugins: []
};
