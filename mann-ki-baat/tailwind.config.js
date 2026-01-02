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
        'mc-green': '#5CAD4A',
        'mc-dark-green': '#3B7C2F',
        'mc-brown': '#8B7355',
        'mc-dark-brown': '#6B4F32',
        'mc-gray': '#9C9C9C',
        'mc-dark-gray': '#6D6D6D',
        'mc-blue': '#3D7EAA',
        'mc-dark-blue': '#2A5C8A',
        'mc-red': '#B02E26',
        'mc-yellow': '#FED83D',
        'mc-dirt': '#9C7C5A',
        'mc-grass': '#7CBD6B',
        'mc-stone': '#A0A0A0',
        'mc-wood': '#AB8B65',
        'mc-water': '#3A7EAA',
        'mc-sky': '#7EC0EE',
      },
      fontFamily: {
        'minecraft': ['"Minecraft"', 'monospace'],
        'minecraft-bold': ['"Minecraft-Bold"', 'monospace'],
        'minecraft-ten': ['"Minecraft-Ten"', 'monospace'],
      },
      animation: {
        'block-break': 'block-break 0.5s ease-out',
        'block-place': 'block-place 0.3s ease-out',
        'pixel-bounce': 'pixel-bounce 0.5s ease-in-out',
        'item-spin': 'item-spin 2s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'minecraft-load': 'minecraft-load 1s ease-in-out infinite',
      },
      keyframes: {
        'block-break': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.1)', opacity: '0.8' },
          '100%': { transform: 'scale(0.5)', opacity: '0' },
        },
        'block-place': {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'pixel-bounce': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'item-spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(91, 205, 74, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(91, 205, 74, 0.8)' },
        },
        'minecraft-load': {
          '0%, 100%': { width: '0%' },
          '50%': { width: '100%' },
        },
      },
      backgroundImage: {
        'minecraft-dirt': 'url("/images/minecraft-dirt-bg.png")',
        'minecraft-grass': 'url("/images/minecraft-grass-bg.png")',
        'minecraft-stone': 'url("/images/minecraft-stone-bg.png")',
        'minecraft-sky': 'linear-gradient(to bottom, #7EC0EE 0%, #3D7EAA 100%)',
      },
    },
  },
  plugins: [],
}