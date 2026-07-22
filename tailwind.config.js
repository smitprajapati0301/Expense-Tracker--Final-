export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Trackify Primary Blue
        primary: {
          DEFAULT: '#0058be',
          light:   '#2170e4',
          50:      '#eef4ff',
          100:     '#d8e2ff',
          200:     '#adc6ff',
          300:     '#6e9fff',
          400:     '#3d7bff',
          500:     '#0058be',
          600:     '#004395',
          700:     '#001a42',
        },
        // Income (Green)
        income: {
          DEFAULT: '#006c49',
          light:   '#6cf8bb',
          100:     '#6ffbbe',
          200:     '#4edea3',
        },
        // Expense (Red)
        expense: {
          DEFAULT: '#b61722',
          light:   '#da3437',
          100:     '#ffdad6',
        },
        // Surface palette
        surface: {
          DEFAULT:   '#f9f9ff',
          dim:       '#d3daea',
          bright:    '#f9f9ff',
          low:       '#f0f3ff',
          mid:       '#e7eefe',
          high:      '#e2e8f8',
          highest:   '#dce2f3',
          variant:   '#dce2f3',
        },
        // On-surface text
        'on-surface':         '#151c27',
        'on-surface-variant': '#424754',
        // Outline
        outline:        '#727785',
        'outline-light': '#c2c6d6',
        // Dark mode surfaces
        dark: {
          bg:      '#111827',
          surface: '#1a2235',
          card:    '#1e2a3b',
          border:  'rgba(255,255,255,0.08)',
        },
        // Keep old neutral for backward compat
        neutral: {
          50:  '#fbfbfc',
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
        // Keep old accent for backward compat
        accent: {
          50:      '#eef6ff',
          100:     '#d8eaff',
          DEFAULT: '#2b7cff',
          600:     '#1e63d8',
        },
      },
      fontFamily: {
        serif: ['"Libre Caslon Text"', 'Georgia', 'serif'],
        sans:  ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm:   '4px',
        md:   '12px',
        lg:   '16px',
        xl:   '24px',
        '2xl':'28px',
        full: '9999px',
      },
      boxShadow: {
        // Ultra-soft floating shadows
        card:    '0 10px 30px rgba(0,0,0,0.04)',
        float:   '0 20px 60px rgba(0,0,0,0.08)',
        glow:    '0 4px 20px rgba(0,88,190,0.35)',
        'glow-sm':'0 2px 12px rgba(0,88,190,0.25)',
        thin:    '0 3px 10px rgba(19,24,29,0.04)',
        subtle:  '0 6px 18px rgba(19,24,29,0.06)',
      },
      backdropBlur: {
        sm:  '6px',
        md:  '12px',
        lg:  '16px',
      },
      transitionTimingFunction: {
        'gentle': 'cubic-bezier(.2,.9,.3,1)',
        'spring': 'cubic-bezier(0.34,1.56,0.64,1)',
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%':   { opacity: '0', transform: 'translateY(100%)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 4px 20px rgba(0,88,190,0.35)' },
          '50%':      { boxShadow: '0 4px 28px rgba(0,88,190,0.55)' },
        },
      },
      animation: {
        'fade-up':    'fade-up 0.4s cubic-bezier(.2,.9,.3,1) both',
        'slide-up':   'slide-up 0.38s cubic-bezier(.2,.9,.3,1) both',
        'scale-in':   'scale-in 0.3s cubic-bezier(.2,.9,.3,1) both',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
