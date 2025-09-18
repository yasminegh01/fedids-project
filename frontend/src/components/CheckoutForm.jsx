// frontend/src/components/CheckoutForm.jsx
import React, { useState, useEffect } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

export default function CheckoutForm({ onPaymentSuccess }) {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState(''); // 'succeeded', 'failed', ''

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;
        
        setIsLoading(true);
        setMessage('');

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            redirect: "if_required" // Ne redirige pas, on gère tout ici
        });
        
        if (error) {
            setMessage(error.message);
            setPaymentStatus('failed');
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            setMessage("Payment Successful! Your account will be upgraded shortly.");
            setPaymentStatus('succeeded');
            onPaymentSuccess(); // Notifier le parent que tout est OK
        } else {
            setMessage("Payment is processing or has an unexpected status.");
        }
        
        setIsLoading(false);
    };

    // Le formulaire est désactivé APRÈS un paiement réussi pour éviter de le soumettre à nouveau.
    const isFormDisabled = isLoading || paymentStatus === 'succeeded';

    return (
        <form id="payment-form" onSubmit={handleSubmit}>
            <PaymentElement id="payment-element" />
            <button disabled={isFormDisabled} className="w-full mt-6 ...">
                <span>{isLoading ? "Processing..." : "Pay Now"}</span>
            </button>
            
            {/* Afficher les messages de succès ou d'erreur */}
            {message && (
                <div className={`mt-4 text-sm text-center font-semibold p-2 rounded ${paymentStatus === 'succeeded' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message}
                </div>
            )}
        </form>
    );
}