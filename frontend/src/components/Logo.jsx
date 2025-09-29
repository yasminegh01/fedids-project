



// frontend/src/components/Logo.jsx
import React from 'react';
import { useTheme } from '../context/ThemeContext';
import logoLight from '../assets/logo-light.png'; // Logo pour fond sombre
import logoDark from '../assets/logo-dark.png';   // Logo pour fond clair

export default function Logo() {
    const { theme } = useTheme();
    return (
        <img 
            src={theme === 'light' ? logoDark : logoLight} 
            alt="FedIds Logo" 
            className="h-80 w-auto" 
        />
    );
}