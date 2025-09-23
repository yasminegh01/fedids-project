// frontend/src/pages/SignUpPage.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

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
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        full_name: '',
        company: '',
        country: ''
    });
    
    
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

const handleSignUp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg('');
        try {
            await apiClient.post('/api/auth/register', formData);
            navigate('/verify-email', { state: { email: formData.email } });
        } catch (error) {
            setErrorMsg(error.response?.data?.detail || 'An error occurred.');
        } finally {
            setIsLoading(false);
        }
    };


    const handleGoogleLogin = () => {
        window.location.href = 'http://127.0.0.1:8000/api/auth/google';
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Create Your Account</h2>
                {errorMsg && <p className="text-center text-red-500 bg-red-100 p-3 rounded-md mb-4">{errorMsg}</p>}
                
                <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="full_name" type="text" placeholder="Full Name" value={formData.full_name} onChange={handleInputChange} className="w-full p-3 border rounded-lg shadow-sm" required />
                        <input name="username" type="text" placeholder="Username" value={formData.username} onChange={handleInputChange} className="w-full p-3 border rounded-lg shadow-sm" required />
                    </div>
                    <input name="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleInputChange} className="w-full p-3 border rounded-lg shadow-sm" required />
                    <div className="relative">
                        <input name="password" type={showPassword ? "text" : "password"} placeholder="Password (min. 8 characters)" value={formData.password} onChange={handleInputChange} className="w-full p-3 border rounded-lg shadow-sm" required minLength="8"/>
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500">
                            {showPassword ? <EyeSlashIcon className="h-5 w-5"/> : <EyeIcon className="h-5 w-5"/>}
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="company" type="text" placeholder="Company (Optional)" value={formData.company} onChange={handleInputChange} className="w-full p-3 border rounded-lg shadow-sm" />
                        <input name="country" type="text" placeholder="Country (Optional)" value={formData.country} onChange={handleInputChange} className="w-full p-3 border rounded-lg shadow-sm" />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400" disabled={isLoading}>
                        {isLoading ? 'Creating...' : 'Create Account'}
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