/** @type {import('tailwindcss').Config} */
// frontend/tailwind.config.js
export default {
  darkMode: 'class', // Activer le mode sombre basé sur une classe CSS
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        'admin-primary': '#1E293B', // Bleu-gris très sombre
        'admin-secondary': '#334155',
        'admin-accent': '#4F46E5', // Indigo vif
      },
    },
  },
  plugins: [],
}