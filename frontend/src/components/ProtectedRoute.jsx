// frontend/src/components/ProtectedRoute.jsx

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requiredRole }) {
    const { isLoggedIn, role, isInitialized } = useAuth();
    const location = useLocation();

    // Si le contexte n'a pas encore fini de vérifier le localStorage, on attend.
    if (!isInitialized) {
        return <div className="h-screen flex items-center justify-center">Loading session...</div>;
    }

    // Si l'utilisateur n'est pas connecté, on le redirige vers la page de connexion.
    // On garde en mémoire la page où il voulait aller (`from: location`) pour l'y renvoyer après.
    if (!isLoggedIn) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Si un rôle spécifique est requis (ex: 'admin') ET que l'utilisateur n'a pas ce rôle,
    // on le redirige vers son dashboard par défaut.
    if (requiredRole && role !== requiredRole) {
        // Un utilisateur normal qui essaie d'accéder à /admin sera renvoyé vers /dashboard.
        return <Navigate to="/dashboard" replace />;
    }
    
    // Si toutes les conditions sont remplies, on affiche la page demandée.
    return children;
}