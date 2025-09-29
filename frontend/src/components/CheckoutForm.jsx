import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

export default function CheckoutForm({ onPaymentSuccess }) {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;
        
        setIsLoading(true);
        setMessage('');

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            redirect: "if_required"
        });
        
        if (error) {
            setMessage(error.message);
            setPaymentStatus('failed');
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            setMessage("Payment Successful! Your account will be upgraded shortly.");
            setPaymentStatus('succeeded');
            onPaymentSuccess();
        } else {
            setMessage("Payment is processing or has an unexpected status.");
        }
        
        setIsLoading(false);
    };

    const isFormDisabled = isLoading || paymentStatus === 'succeeded';

    return (
        <form id="payment-form" onSubmit={handleSubmit}>
            {/* Le composant PaymentElement de Stripe s'adapte automatiquement au thème */}
            {/* que nous avons défini dans UserUpgradePage.jsx */}
            <PaymentElement id="payment-element" />
            
            {/* Le bouton utilise maintenant les couleurs du thème */}
            <button 
                disabled={isFormDisabled} 
                className="w-full mt-6 px-6 py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-lg shadow-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                <span>{isLoading ? "Processing..." : "Pay Now"}</span>
            </button>
            
            {/* Les messages de feedback utilisent les couleurs du thème */}
            {message && (
                <div className={`mt-4 text-sm text-center font-semibold p-3 rounded-md ${
                    paymentStatus === 'succeeded' 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                        : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                }`}>
                    {message}
                </div>
            )}
        </form>
    );
}