export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neutral: {
          50: '#fbfbfc',
          100: '#f6f7f8',
          200: '#eceef0',
          300: '#dfe3e6',
          400: '#c7cfd4',
          500: '#98a1a8',
          600: '#6b747a',
          700: '#495154',
          800: '#2c3336',
          900: '#0f1315',
        },
        accent: {
          50: '#eef6ff',
          100: '#d8eaff',
          DEFAULT: '#2b7cff',
          600: '#1e63d8',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '14px',
        full: '9999px'
      },
      boxShadow: {
        subtle: '0 6px 18px rgba(19, 24, 29, 0.06)',
        thin: '0 3px 10px rgba(19, 24, 29, 0.04)',
      },
      backdropBlur: {
        sm: '6px',
      },
      transitionTimingFunction: {
        'gentle': 'cubic-bezier(.2,.9,.3,1)',
      }
    },
  },
  plugins: [],
}
