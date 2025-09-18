// frontend/src/pages/AuthCallbackPage.jsx
import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthCallbackPage() {
    const [searchParams] = useSearchParams();
    const { login } = useAuth();

    useEffect(() => {
        const token = searchParams.get('token');
        const userJson = searchParams.get('user');

        if (token && userJson) {
            try {
                const userData = JSON.parse(userJson);
                // Appeler la fonction de login du contexte pour finaliser
                login(userData, token);
            } catch (error) {
                console.error("Failed to parse user data from URL", error);
                // Gérer l'erreur, peut-être rediriger vers le login avec un message
            }
        }
    }, [searchParams, login]);

    return (
        <div className="h-screen flex items-center justify-center">
            <p>Finalizing authentication, please wait...</p>
        </div>
    );
}