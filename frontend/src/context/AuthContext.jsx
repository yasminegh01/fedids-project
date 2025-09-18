// frontend/src/context/AuthContext.jsx

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false); // Commence à false

    // Ce useEffect ne s'exécute qu'UNE SEULE FOIS au chargement de l'application
    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('user');
            const token = localStorage.getItem('token');
            
            // On considère l'utilisateur comme connecté seulement si on a l'utilisateur ET le token
            if (storedUser && token) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            // Si le JSON est corrompu, on nettoie tout
            localStorage.clear();
        } finally {
            // Quoi qu'il arrive, on marque l'initialisation comme terminée
            setIsInitialized(true);
        }
    }, []); // Le tableau de dépendances vide est CRUCIAL

    const login = useCallback((userData, token) => {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
        setUser(userData);
        
        const destination = userData.role === 'admin' ? '/admin' : '/dashboard';
        navigate(destination, { replace: true });
    }, [navigate]);

    const logout = useCallback(() => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login', { replace: true });
    }, [navigate]);
    
    const refreshUser = useCallback((newUserData) => {
        setUser(newUserData);
        localStorage.setItem('user', JSON.stringify(newUserData));
    }, []);

    const value = { user, login, logout, refreshUser, isInitialized, isLoggedIn: !!user, role: user?.role };
    
    // On n'affiche l'application que lorsque l'initialisation est terminée
    return (
        <AuthContext.Provider value={value}>
            {isInitialized ? children : <div className="h-screen flex items-center justify-center">Loading Session...</div>}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};