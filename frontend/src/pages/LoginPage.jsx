// frontend/src/pages/LoginPage.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import Logo from '../components/Logo'; // On importe le logo pour un meilleur branding

const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">
    <path fill="#4285F4" d="M24 9.5c3.23 0 5.45 1.34 6.7 2.5l5.25-5.25C32.4 3.4 28.5 2 24 2 15.3 2 8.2 6.8 5.4 13.2l6.2 4.8C13 14 18.2 9.5 24 9.5z"></path>
    <path fill="#34A853" d="M24 46c5.8 0 10.3-1.9 13.8-5.2l-6.1-4.7c-1.9 1.3-4.4 2-7.7 2-5.8 0-11-4.5-12.8-10.4l-6.2 4.8C8.2 41.2 15.3 46 24 46z"></path>
    <path fill="#FBBC05" d="M11.2 28.5c-.4-.9-.6-2-.6-3s.2-2.1.6-3L5 17.7C3.8 20.3 3 23.5 3 27s.8 6.7 2 9.3l6.2-4.8z"></path>
    <path fill="#EA4335" d="M24 18.5c3.2 0 6 1.1 8.2 3.2l5.1-5.1C33.8 12.1 29.4 10 24 10c-5.8 0-11-4.5-12.8-10.4l6.2 4.8c1.8-5.9 7-10.4 12.8-10.4z"></path>
  </svg>
);

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    const formData = new URLSearchParams({ username, password });
    try {
      const response = await apiClient.post('/api/auth/login', formData);
      login(response.data.user, response.data.access_token);
    } catch (error) {
      setErrorMsg(error.response?.data?.detail || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://127.0.0.1:8000/api/auth/google';
  };

  return (
   // Arrière-plan plus subtil et centrage
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm">
        
        {/* Logo et Titre */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <Logo />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-gray-500 mt-2">Sign in to access your dashboard.</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-lg space-y-6">
          
          {errorMsg && (
            <p className="text-center text-red-600 bg-red-100 p-3 rounded-md text-sm">
              {errorMsg}
            </p>
          )}

          {/* Username */}
          <div>
            <label className="block text-gray-700 mb-1 font-semibold text-sm">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              required
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-gray-700 font-semibold text-sm">Password</label>
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-blue-600"
              >
                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-300"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Sign In'}
          </button>

          {/* Separator */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">Or</span>
            </div>
          </div>

          {/* Google Login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-800 bg-white hover:bg-gray-50 transition-colors"
          >
            <GoogleIcon />
            Sign In with Google
          </button>
        </form>

        {/* Sign Up Link */}
        <p className="text-center mt-8 text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-600 hover:underline font-semibold">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}