/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'ui-monospace',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          '"Liberation Mono"',
          '"Courier New"',
          'monospace',
        ],
      },
      colors: {
        ide: {
          bg: {
            light: '#f8fafc',
            DEFAULT: '#0f141c',
            dark: '#0b0f17',
          },
          surface: {
            light: '#ffffff',
            DEFAULT: '#141b26',
            dark: '#0f141c',
          },
          panel: {
            light: '#f1f5f9',
            DEFAULT: '#192231',
            dark: '#131923',
          },
          border: {
            light: '#e2e8f0',
            DEFAULT: '#263345',
            dark: '#1e293b',
          },
          text: {
            light: '#0f172a',
            mutedLight: '#64748b',
            DEFAULT: '#e2e8f0',
            muted: '#94a3b8',
          },
          accent: {
            DEFAULT: '#38bdf8',
            hover: '#0ea5e9',
          }
        }
      }
    },
  },
  plugins: [],
}
