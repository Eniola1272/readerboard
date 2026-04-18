import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['DM Sans', 'system-ui', 'sans-serif'],
        serif:   ['Instrument Serif', 'Georgia', 'serif'],
        display: ['Instrument Serif', 'Georgia', 'serif'],
      },
      colors: {
        // Warm amber/brown palette
        brand: {
          50:  '#FEF9EE',
          100: '#FDF3D7',
          200: '#F0E5CC',
          300: '#DCC9A8',
          400: '#C4A97A',
          500: '#A88050',
          600: '#B45309',  // amber-700 — primary actions
          700: '#92400E',  // amber-800 — hover
          800: '#78350F',
          900: '#4A1F0A',
          950: '#1a1a1a',  // near-black text
        },
        surface: {
          DEFAULT:  '#FAF7F2',  // warm parchment
          card:     '#FFFFFF',
          elevated: '#F5F0E8',
          muted:    '#EDE5D8',
        },
      },
      borderRadius: {
        'pill':    '9999px',
        'card':    '16px',
        'card-lg': '24px',
      },
      boxShadow: {
        'soft':      '0 2px 8px rgba(0, 0, 0, 0.06)',
        'glow':      '0 0 20px rgba(180, 83, 9, 0.15)',
        'gold-glow': '0 0 20px rgba(245, 158, 11, 0.3)',
      },
      animation: {
        'float':    'float 6s ease-in-out infinite',
        'shimmer':  'shimmer 2s linear infinite',
        'fade-in':  'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
