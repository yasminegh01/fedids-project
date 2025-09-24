// frontend/src/components/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo'; // Réutilisez votre logo

export default function Header() {
    return (
        <header className="absolute top-0 left-0 w-full z-10 p-5 flex justify-between items-center">
            <Logo />
            <div className="space-x-4">
                <Link to="/login" className="font-semibold text-white hover:text-blue-300 transition">Login</Link>
                <Link to="/signup" className="bg-white text-blue-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-200 transition">Sign Up</Link>
            </div>
        </header>
    );
}