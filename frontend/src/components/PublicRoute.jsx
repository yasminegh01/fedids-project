// frontend/src/components/PublicRoute.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PublicRoute({ children }) {
    const { isLoggedIn, role, isInitialized } = useAuth();

    // Attendre que l'état d'authentification soit confirmé
    if (!isInitialized) {
        return <div>Loading...</div>;
    }

    // Si l'utilisateur est déjà connecté, on le redirige vers son dashboard par défaut.
    if (isLoggedIn) {
        const defaultPath = role === 'admin' ? '/admin' : '/dashboard';
        return <Navigate to={defaultPath} replace />;
    }

    // Si l'utilisateur n'est pas connecté, on affiche la page publique (Login, Signup, etc.).
    return children;
}