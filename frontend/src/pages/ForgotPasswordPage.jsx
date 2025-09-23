// frontend/src/pages/ForgotPasswordPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/apiClient';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [feedback, setFeedback] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await apiClient.post('/api/auth/forgot-password', { email });
            setFeedback(response.data.message);
        } catch (error) {
            setFeedback("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6">Forgot Password</h2>
                {feedback ? (
                    <p className="text-green-600">{feedback}</p>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" required className="w-full p-2 border rounded" />
                        <button type="submit" disabled={isLoading} className="w-full mt-4 bg-blue-600 text-white p-2 rounded">
                            {isLoading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>
                )}
                <Link to="/login" className="block text-center mt-4 text-sm">Back to Login</Link>
            </div>
        </div>
    );
}