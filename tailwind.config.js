/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'cyber-black': '#121212',
        'cyber-dark': '#1a1a1a',
        'cyber-blue': '#0AFFFF',
        'cyber-purple': '#BA01FF',
        'cyber-green': '#39FF14',
        'cyber-yellow': '#FFD700',
        'cyber-red': '#FF073A',
        'cyber-pink': '#FF00F5',
      },
      fontFamily: {
        'cyber': ['Share Tech Mono', 'monospace'],
        'display': ['Rajdhani', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
      },
      animation: {
        'glitch': 'glitch 1s linear infinite',
        'scanline': 'scanline 8s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        'glitch': {
          '0%, 100%': { transform: 'translate(0)' },
          '33%': { transform: 'translate(-5px, 2px)' },
          '66%': { transform: 'translate(5px, -2px)' },
        },
        'scanline': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.6 },
        }
      },
    },
  },
  plugins: [],
};