// frontend/src/components/Header.jsx

import React from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
    return (
        <header className="absolute top-0 left-0 w-full p-5 flex justify-between items-center z-30">
            
            {/* === LE NOM DE L'APPLICATION EST ICI === */}
            {/* On le rend cliquable pour revenir à l'accueil */}
            <Link to="/" className="text-2xl font-bold text-white tracking-wider">
                FedIds
            </Link>
            
            {/* Les boutons restent à droite */}
            <div className="space-x-4">
                <Link to="/login" className="font-semibold text-white hover:text-blue-300 transition">
                    Login
                </Link>
                <Link to="/signup" className="bg-white text-blue-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-200 transition">
                    Sign Up
                </Link>
            </div>
        </header>
    );
}