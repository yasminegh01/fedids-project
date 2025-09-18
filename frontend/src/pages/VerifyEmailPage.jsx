// frontend/src/pages/VerifyEmailPage.jsx

import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const apiClient = axios.create({ baseURL: 'http://127.0.0.1:8000' });

export default function VerifyEmailPage() {
    const navigate = useNavigate();
    const location = useLocation();
    // On récupère l'email de l'utilisateur qui vient de s'inscrire
    const email = location.state?.email;

    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (!email) {
        // Rediriger si on arrive sur cette page sans email (par ex. en tapant l'URL)
        return <Navigate to="/signup" />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');
        try {
            await apiClient.post('/api/auth/verify', { email, code });
            setSuccess('Verification successful! You will be redirected to the login page.');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.detail || "Verification failed.");
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-sm">
                <h2 className="text-2xl font-bold mb-2 text-center">Verify Your Email</h2>
                <p className="text-center text-sm text-gray-600 mb-6">
                    A verification code was "sent" to <strong>{email}</strong>.
                    (In dev mode, check your backend console for the code).
                </p>

                {error && <p className="... text-red-500 ...">{error}</p>}
                {success && <p className="... text-green-500 ...">{success}</p>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-1">Verification Code</label>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="w-full p-2 text-center text-2xl tracking-[.5em] font-mono border rounded"
                            maxLength="6"
                            required
                        />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 ..." disabled={isLoading || success}>
                        {isLoading ? "Verifying..." : "Verify Account"}
                    </button>
                </form>
                <p className="text-center mt-4 text-xs">
                    Entered the wrong email? <Link to="/signup" className="text-blue-600 hover:underline">Go back to Sign Up</Link>
                </p>
            </div>
        </div>
    );
}