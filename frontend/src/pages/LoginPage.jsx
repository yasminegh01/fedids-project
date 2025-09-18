// frontend/src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient'; // <<< CORRECT IMPORT

// --- API client configuré ---

// --- Icône Google ---
const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">
    <path fill="#4285F4" d="M24 9.5c3.23 0 5.45 1.34 6.7 2.5l5.25-5.25C32.4 3.4 28.5 2 24 2 15.3 2 8.2 6.8 5.4 13.2l6.2 4.8C13 14 18.2 9.5 24 9.5z"></path>
    <path fill="#34A853" d="M24 46c5.8 0 10.3-1.9 13.8-5.2l-6.1-4.7c-1.9 1.3-4.4 2-7.7 2-5.8 0-11-4.5-12.8-10.4l-6.2 4.8C8.2 41.2 15.3 46 24 46z"></path>
    <path fill="#FBBC05" d="M11.2 28.5c-.4-.9-.6-2-.6-3s.2-2.1.6-3L5 17.7C3.8 20.3 3 23.5 3 27s.8 6.7 2 9.3l6.2-4.8z"></path>
    <path fill="#EA4335" d="M24 18.5c3.2 0 6 1.1 8.2 3.2l5.1-5.1C33.8 12.1 29.4 10 24 10c-5.8 0-11 4.5-12.8 10.4l6.2 4.8c1.8-5.9 7-10.4 12.8-10.4z"></path>
  </svg>
);

export default function LoginPage() {
  const { login } = useAuth();

  const [username, setUsername] = useState('yasmine'); // Pré-rempli pour tests rapides
  const [password, setPassword] = useState('yasmine');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // --- Connexion classique ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    const formData = new URLSearchParams({ username, password });

    try {
      const response = await apiClient.post('/api/auth/login', formData);
      const { access_token, user } = response.data;

      // Mise à jour via le contexte (AuthContext)
      login(user, access_token);

      // Redirection en fonction du rôle
      window.location.href = user.role === 'admin' ? '/admin' : '/dashboard';
    } catch (error) {
      setErrorMsg(error.response?.data?.detail || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Connexion via Google ---
  const handleGoogleLogin = () => {
    window.location.href = 'http://127.0.0.1:8000/api/auth/google';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-xl w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Welcome Back</h2>

        {errorMsg && (
          <p className="text-center text-red-500 bg-red-100 p-3 rounded-md text-sm mb-4">
            {errorMsg}
          </p>
        )}

        {/* --- Username --- */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-1 font-semibold">Username</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        {/* --- Password --- */}
        <div className="mb-6">
          <label className="block text-gray-700 mb-1 font-semibold">Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        {/* --- Bouton login --- */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 font-semibold"
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>

        {/* --- Séparateur --- */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">Or continue with</span>
          </div>
        </div>

        {/* --- Bouton Google --- */}
        <div>
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <GoogleIcon />
            Continue with Google
          </button>
        </div>

        {/* --- Lien vers inscription --- */}
        <p className="text-center mt-4 text-sm">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-600 hover:underline font-semibold">
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
}
