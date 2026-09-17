/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Deep, low-chroma ink for surfaces — not pure black, keeps the app
        // calm at high information density (tables, forms, POS entry).
        ink: {
          950: "#15130f",
          900: "#1f1c16",
          800: "#2b2720",
          700: "#3a3529",
          600: "#4d4636",
        },
        // Warm parchment surfaces instead of stark white — nods to the
        // jewelry-shop setting without becoming decorative or slow to scan.
        parchment: {
          50: "#fbf9f4",
          100: "#f4efe4",
          200: "#e9e0cd",
        },
        // Muted brass/gold accent used sparingly for primary actions and
        // focus states — restrained, not shiny/gradient.
        brass: {
          400: "#c9a15a",
          500: "#b3894a",
          600: "#96703a",
        },
        signal: {
          error: "#b3432f",
          success: "#4c7a4a",
          warning: "#b3894a",
        },
      },
      fontFamily: {
        display: ["\"Fraunces\"", "ui-serif", "Georgia", "serif"],
        sans: ["\"Inter\"", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["\"IBM Plex Mono\"", "ui-monospace", "SFMono-Regular", "monospace"],
      },
    },
  },
  plugins: [],
};
