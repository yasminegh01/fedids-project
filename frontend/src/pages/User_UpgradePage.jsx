// frontend/src/pages/UserUpgradePage.jsx

import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import { Link } from 'react-router-dom';
import CheckoutForm from '../components/CheckoutForm'; // On suppose que CheckoutForm est dans son propre fichier

// Mettre la clé publique dans .env.local est une bonne pratique
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function UserUpgradePage() {
    const { user, refreshUser } = useAuth(); // On a besoin de refreshUser ici
    const [clientSecret, setClientSecret] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    // Étape 1 : Créer l'intention de paiement au chargement
    useState(() => {
        if (user?.role !== 'premium') {
            apiClient.post("/api/payments/create-payment-intent")
                .then(res => {
                    setClientSecret(res.data.clientSecret);
                    setIsLoading(false);
                })
                .catch(err => console.error("Failed to create PI", err));
        }
    }, [user.role]);
    
    // Étape 3 (cruciale) : Ce qui se passe APRES le succès du formulaire Stripe
    const onPaymentSuccess = async () => {
        try {
            // Après le succès Stripe, on appelle notre propre API pour changer le rôle
            const response = await apiClient.post('/api/users/me/upgrade-to-premium');
            // On met à jour le contexte global avec les nouvelles données (qui contiennent le rôle 'premium')
            refreshUser(response.data);
            // La redirection peut maintenant être gérée par le composant lui-même
        } catch(error) {
            console.error("Failed to finalize upgrade after payment", error);
            alert("Payment was successful, but there was an issue updating your account. Please contact support.");
        }
    };
    
    // Si l'utilisateur est déjà premium, afficher la confirmation
    if (user?.role === 'premium') {
        return (
            <div className="text-center p-8 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-green-600">🎉 Premium Plan Active</h2>
                {user.subscription_valid_until && 
                    <p className="my-4 text-gray-600">Your premium features, including Intelligent Prevention, are active until:<br/>
                        <strong>{new Date(user.subscription_valid_until).toLocaleDateString()}</strong>
                    </p>
                }
                {/* Le bouton est maintenant "Manage Subscription" (ou retour) */}
                <Link to="/dashboard/devices" className="...">Manage My Devices</Link>
            </div>
        );
    }
    
    return (
        <div className="bg-white rounded-lg shadow-xl max-w-lg mx-auto p-8">
            <h1 className="text-3xl font-bold text-center">Go Premium</h1>
            <div className="text-center my-6">
                <p className="text-5xl font-extrabold">500 DZD</p>
                <p className="text-gray-500">for 3 months</p>
            </div>

            {isLoading && <div>Loading secure payment form...</div>}
            
            {clientSecret && (
                <Elements options={{ clientSecret, appearance:{theme: 'stripe'} }} stripe={stripePromise}>
                    {/* On passe la fonction de callback à notre formulaire */}
                    <CheckoutForm onPaymentSuccess={onPaymentSuccess} />
                </Elements>
            )}
        </div>
    );
}