/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        agri: {
          primary: "#166534",       // Deep agricultural green
          primaryLight: "#22C55E",  // Vibrant growth green
          primaryDark: "#14532D",   // Dark forest green
          bg: "#F7FAF7",            // Soothing agricultural off-white
          surface: "#FFFFFF",       // Clean card surface
          text: "#17251B",          // High-contrast deep slate text
          muted: "#64748B",         // Informational secondary text
          border: "#E2E8E2",        // Crisp subtle borders
          warning: "#F59E0B",       // Advisory / caution
          danger: "#DC2626",        // Disease / critical alert
          info: "#2563EB",          // Intelligence / insight
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          '"Noto Sans Tamil"',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif'
        ],
        tamil: [
          '"Noto Sans Tamil"',
          'Inter',
          'sans-serif'
        ]
      },
      boxShadow: {
        'card': '0 2px 8px -2px rgba(22, 101, 52, 0.06), 0 1px 4px -1px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 8px 24px -4px rgba(22, 101, 52, 0.12), 0 2px 6px -2px rgba(0, 0, 0, 0.04)',
        'hero': '0 12px 32px -6px rgba(22, 101, 52, 0.15)',
        'modal': '0 20px 40px -10px rgba(23, 37, 27, 0.25)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      minHeight: {
        'touch': '48px',
      },
      minWidth: {
        'touch': '48px',
      }
    },
  },
  plugins: [],
}
