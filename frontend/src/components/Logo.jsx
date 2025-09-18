// frontend/src/components/Logo.jsx
import React from 'react';
import { Link } from 'react-router-dom';

// === LA CORRECTION EST ICI ===
// On importe l'image depuis le dossier `src/assets`
import logoImage from '../assets/logo.png'; // Assurez-vous que le nom du fichier est correct

export default function Logo() {
    return (
        <Link to="/" className="flex items-center gap-3">
            {/* On utilise la variable importée */}
            <img src={logoImage} alt="FedIds Logo" className="h-64 w-auto" />
            <span className="text-2xl font-bold text-white">FedIds</span>
        </Link>
    );
}