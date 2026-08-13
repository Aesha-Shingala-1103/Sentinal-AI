/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sentinel: {
          bg: '#050816',
          surface: '#0a0f24',
          panel: '#0d1330',
          border: '#1a2a52',
          cyan: '#00E5FF',
          'cyan-dim': '#0099b3',
          'cyan-glow': 'rgba(0, 229, 255, 0.4)',
          text: '#e8f4ff',
          muted: '#7a8bb0',
          warning: '#ffb547',
          success: '#3ddc97',
          error: '#ff5470',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'cyan-glow': '0 0 40px rgba(0, 229, 255, 0.25)',
        'cyan-glow-lg': '0 0 80px rgba(0, 229, 255, 0.35)',
        'cyan-glow-xl': '0 0 120px rgba(0, 229, 255, 0.45)',
        'inner-glow': 'inset 0 0 30px rgba(0, 229, 255, 0.08)',
        'glass-reflection': 'inset 1px 1px 0 0 rgba(255,255,255,0.06), inset -1px -1px 0 0 rgba(0,229,255,0.04)',
      },
      animation: {
        'spin-slow': 'spin 24s linear infinite',
        'spin-reverse': 'spin 18s linear infinite reverse',
        'spin-globe': 'spin-globe 30s linear infinite',
        'pulse-ring': 'pulse-ring 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 6s linear infinite',
        'scan-vertical': 'scan-vertical 7s ease-in-out infinite',
        'flicker': 'flicker 4s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 9s ease-in-out infinite',
        'gradient': 'gradient 8s ease infinite',
        'radar-sweep': 'radar-sweep 4s linear infinite',
        'orbit': 'orbit 20s linear infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        'pulse-ring': {
          '0%': { transform: 'scale(0.8)', opacity: '0.8' },
          '100%': { transform: 'scale(2.4)', opacity: '0' },
        },
        'scan': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'scan-vertical': {
          '0%, 100%': { transform: 'translateY(0)', opacity: '0' },
          '10%': { opacity: '1' },
          '50%': { transform: 'translateY(50vh)', opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'flicker': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'gradient': {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
        'radar-sweep': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'spin-globe': {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(360deg)' },
        },
        'orbit': {
          '0%': { transform: 'rotate(0deg) translateX(120px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(120px) rotate(-360deg)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
