// frontend/src/pages/SignUpPage.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/apiClient';

// Composant pour l'icône Google (réutilisé)
const GoogleIcon = () => (
    <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">
        <path fill="#4285F4" d="M24 9.5c3.23 0 5.45 1.34 6.7 2.5l5.25-5.25C32.4 3.4 28.5 2 24 2 15.3 2 8.2 6.8 5.4 13.2l6.2 4.8C13 14 18.2 9.5 24 9.5z" />
        <path fill="#34A853" d="M24 46c5.8 0 10.3-1.9 13.8-5.2l-6.1-4.7c-1.9 1.3-4.4 2-7.7 2-5.8 0-11-4.5-12.8-10.4l-6.2 4.8C8.2 41.2 15.3 46 24 46z" />
        <path fill="#FBBC05" d="M11.2 28.5c-.4-.9-.6-2-.6-3s.2-2.1.6-3L5 17.7C3.8 20.3 3 23.5 3 27s.8 6.7 2 9.3l6.2-4.8z" />
        <path fill="#EA4335" d="M24 18.5c3.2 0 6 1.1 8.2 3.2l5.1-5.1C33.8 12.1 29.4 10 24 10c-5.8 0-11-4.5-12.8-10.4l6.2 4.8c1.8-5.9 7-10.4 12.8-10.4z" />
    </svg>
);

export default function SignUpPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const handleSignUp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg('');
        try {
            await apiClient.post('/api/auth/register', { email, username, password });
            navigate('/verify-email', { state: { email: email } });
        } catch (error) {
            setErrorMsg(error.response?.data?.detail || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = 'http://127.0.0.1:8000/api/auth/google';
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-sm">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Create a New Account</h2>
                
                {errorMsg && <p className="text-center text-red-500 bg-red-100 p-3 rounded-md mb-4">{errorMsg}</p>}
                
                <form onSubmit={handleSignUp} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 mb-1 font-semibold">Email Address</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border rounded-md" required />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-1 font-semibold">Username</label>
                        <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full p-2 border rounded-md" required />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-1 font-semibold">Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 border rounded-md" required minLength="8"/>
                    </div>
                    <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 font-semibold" disabled={isLoading}>
                        {isLoading ? 'Creating...' : 'Sign Up'}
                    </button>
                </form>
                
                {/* --- CETTE PARTIE ÉTAIT MANQUANTE --- */}
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"/></div>
                    <div className="relative flex justify-center text-sm"><span className="bg-white px-2 text-gray-500">Or continue with</span></div>
                </div>

                <div>
                    <button 
                        type="button" 
                        onClick={handleGoogleLogin}
                        className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md"
                    >
                        <GoogleIcon />
                        Continue with Google
                    </button>
                </div>
                {/* --- FIN DE LA PARTIE MANQUANTE --- */}
                
                <p className="text-center mt-6 text-sm">
                    Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
}