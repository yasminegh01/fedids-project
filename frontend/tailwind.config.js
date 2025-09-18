/** @type {import('tailwindcss').Config} */

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // === AJOUTEZ CE BLOC DE COULEURS ===
      colors: {
        'primary': '#0A192F',      // Bleu Nuit
        'secondary': '#8892B0',    // Bleu Acier
        'accent': {
          DEFAULT: '#e4d4a3ff',    // Ambre Vif
          'hover': '#FFD700'     // Une version légèrement plus claire pour le survol
        },
        'main-text': '#CCD6F6',   // Texte principal
        'light-bg': '#F0F2F5',    // Fond clair pour le contenu principal
      },
      // === FIN DU BLOC ===
    },
  },
  plugins: [],
}