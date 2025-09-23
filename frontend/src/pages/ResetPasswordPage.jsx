// frontend/src/pages/ResetPasswordPage.jsx

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/apiClient';

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const [token, setToken] = useState(null);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [feedback, setFeedback] = useState({ type: '', message: '' });
    const [isLoading, setIsLoading] = useState(false);

    // Récupérer le token de l'URL au premier chargement
    useEffect(() => {
        const urlToken = searchParams.get('token');
        if (!urlToken) {
            setFeedback({ type: 'error', message: 'Invalid or missing reset token.' });
        }
        setToken(urlToken);
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setFeedback({ type: 'error', message: 'Passwords do not match.' });
            return;
        }
        if (!token) return;

        setIsLoading(true);
        try {
            const response = await apiClient.post('/api/auth/reset-password', { token, new_password: password });
            setFeedback({ type: 'success', message: `${response.data.message} Redirecting to login...` });
            setTimeout(() => navigate('/login'), 3000); // Rediriger après 3 secondes
        } catch (error) {
            setFeedback({ type: 'error', message: error.response?.data?.detail || "Failed to reset password." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6">Reset Your Password</h2>
                
                {feedback.message && (
                    <div className={`p-3 rounded text-center ${feedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {feedback.message}
                        {feedback.type === 'success' && <Link to="/login" className="block font-bold mt-2">Go to Login</Link>}
                    </div>
                )}

                {!feedback.message && token && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label>New Password</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full p-2 border rounded" />
                        </div>
                        <div>
                            <label>Confirm New Password</label>
                            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full p-2 border rounded" />
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full mt-4 bg-blue-600 text-white p-2 rounded">
                            {isLoading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}