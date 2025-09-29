/** @type {import('tailwindcss').Config} */
export default {
  // On dit à Tailwind de chercher la classe "dark" sur l'élément <html>
  darkMode: 'class', 
  
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // On définit nos couleurs sémantiques ici
      colors: {
        // Pour le texte
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        
        // Pour les arrière-plans
        'bg-primary': 'var(--color-bg-primary)',
        'bg-secondary': 'var(--color-bg-secondary)',
        
        // Pour les accents (boutons, liens, etc.)
        'accent': 'var(--color-accent)',
        'accent-hover': 'var(--color-accent-hover)',
      },
    },
  },
  plugins: [],
}