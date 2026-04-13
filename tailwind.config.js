/** @type {import('tailwindcss').Config} */

const plugin = require('tailwindcss/plugin')

module.exports = {
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "#1f0438",
        surface: "#1f0438",
        "surface-dim": "#1f0438",
        "surface-bright": "#472d60",
        "surface-container-lowest": "#190032",
        "surface-container-low": "#280e40",
        "surface-container": "#2c1245",
        "surface-container-high": "#371e50",
        "surface-container-highest": "#43295b",
        "surface-variant": "#43295b",
        "on-surface": "#f0dbff",
        "on-surface-variant": "#cec2da",
        "on-background": "#f0dbff",
        primary: "#d5baff",
        "primary-container": "#8000ff",
        "primary-fixed": "#ecdcff",
        "primary-fixed-dim": "#d5baff",
        "on-primary": "#42008a",
        "on-primary-container": "#e7d4ff",
        "on-primary-fixed": "#270057",
        "on-primary-fixed-variant": "#5f00c0",
        "inverse-primary": "#7d00fa",
        secondary: "#ffabf3",
        "secondary-container": "#f729f6",
        "secondary-fixed": "#ffd7f5",
        "secondary-fixed-dim": "#ffabf3",
        "on-secondary": "#5b005b",
        "on-secondary-container": "#500050",
        "on-secondary-fixed": "#380038",
        "on-secondary-fixed-variant": "#810081",
        tertiary: "#deb7ff",
        "tertiary-container": "#7e44b4",
        "tertiary-fixed": "#f0dbff",
        "tertiary-fixed-dim": "#deb7ff",
        "on-tertiary": "#4a0080",
        "on-tertiary-container": "#ecd3ff",
        "on-tertiary-fixed": "#2c0050",
        "on-tertiary-fixed-variant": "#622698",
        error: "#ffb4ab",
        "error-container": "#93000a",
        "on-error": "#690005",
        "on-error-container": "#ffdad6",
        outline: "#978da3",
        "outline-variant": "#4b4356",
        "surface-tint": "#d5baff",
        "inverse-surface": "#f0dbff",
        "inverse-on-surface": "#3e2457",
      },
      fontFamily: {
        headline: ["Plus Jakarta Sans", "sans-serif"],
        body: ["Inter", "sans-serif"],
        label: ["Space Grotesk", "sans-serif"],
        "display": ["Plus Jakarta Sans", "sans-serif"],
        "sans": ["Inter", "sans-serif"],
      },
      animation: {
        vote: 'vote 1s ease-in-out',
      },
      keyframes: {
        vote: {
          '0%, 100%': {
            transform: 'translate(0deg)',
          },
          '25%': {
            transform: 'translate(-30deg)',
          },
          '75%': {
            transform: 'translate(30deg)',
          },
        },
      },
      bgGradientDeg: {
        75: '75deg',
      },
      borderWidth: ['responsive', 'hover', 'focus'],
    },
    screens: {
      'xs':'370px',
      'sm': '640px',
      // => @media (min-width: 640px) { ... }

      'md': '768px',
      // => @media (min-width: 768px) { ... }

      'lg': '1024px',
      // => @media (min-width: 1024px) { ... }

      'xl': '1280px',
      // => @media (min-width: 1280px) { ... }

      '2xl': '1536px',
      // => @media (min-width: 1536px) { ... }
    }
  },
  plugins: [
    plugin(function({ matchUtilities, theme }) {
      matchUtilities(
          {
              'bg-gradient': (angle) => ({
                  'background-image': `linear-gradient(${angle}, var(--tw-gradient-stops))`,
              }),
          },
          {
              values: Object.assign(
                  theme('bgGradientDeg', {}),
                  {
                      10: '10deg',
                      15: '15deg',
                      20: '20deg',
                      25: '25deg',
                      30: '30deg',
                      45: '45deg',
                      60: '60deg',
                      90: '90deg',
                      120: '120deg',
                      135: '135deg',
                  }
              )
          }
      )
  })
  ],
}
