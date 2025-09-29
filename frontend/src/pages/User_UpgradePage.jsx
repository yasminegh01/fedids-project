import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext'; // <<< 1. IMPORTER LE HOOK DE THÈME
import apiClient from '../api/apiClient';
import { Link } from 'react-router-dom';
import CheckoutForm from '../components/CheckoutForm';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function UserUpgradePage() {
    const { user, refreshUser } = useAuth();
    const { theme } = useTheme(); // <<< 2. RÉCUPÉRER LE THÈME ACTUEL
    const [clientSecret, setClientSecret] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user?.role !== 'premium') {
            apiClient.post("/api/payments/create-payment-intent")
                .then(res => {
                    setClientSecret(res.data.clientSecret);
                    setIsLoading(false);
                })
                .catch(err => console.error("Failed to create PI", err));
        } else {
            setIsLoading(false);
        }
    }, [user?.role]);
    
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
    
    // === 3. DÉFINIR LES OPTIONS POUR STRIPE DE MANIÈRE DYNAMIQUE ===
    const stripeOptions = {
        clientSecret,
        appearance: {
            theme: theme === 'light' ? 'stripe' : 'night',
            labels: 'floating',
        },
    };

    if (isLoading) {
        return <div className="text-center p-10 text-text-secondary">Loading...</div>;
    }
    
    if (user?.role === 'premium') {
        return (
            <div className="text-center p-8 bg-bg-primary rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-green-500">🎉 Premium Plan Active</h2>
                {user.subscription_valid_until && 
                    <p className="my-4 text-text-secondary">Your premium features are active until:<br/>
                        <strong className="text-text-primary">{new Date(user.subscription_valid_until).toLocaleDateString()}</strong>
                    </p>
                }
                <Link to="/dashboard/devices" className="inline-block mt-4 px-6 py-2 bg-accent hover:bg-accent-hover text-white font-semibold rounded-lg">
                    Manage My Devices
                </Link>
            </div>
        );
    }
    
    return (
        <div className="bg-bg-primary rounded-lg shadow-xl max-w-lg mx-auto p-8">
            <h1 className="text-3xl font-bold text-center text-text-primary">Go Premium</h1>
            <div className="text-center my-6">
                <p className="text-5xl font-extrabold text-text-primary">500 DZD</p>
                <p className="text-text-secondary">for 3 months</p>
            </div>

            {clientSecret ? (
                <Elements options={stripeOptions} stripe={stripePromise}>
                    <CheckoutForm onPaymentSuccess={onPaymentSuccess} />
                </Elements>
            ) : (
                <div className="text-center text-text-secondary">Initializing secure payment form...</div>
            )}
        </div>
    );
}