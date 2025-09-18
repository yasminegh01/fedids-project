import React from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

import UserDashboard from '../pages/User_Dashboard';
import UserDevices from '../pages/User_Devices';
import UserProfile from '../pages/User_Profile';
import UserUpgradePage from '../pages/User_UpgradePage';
import { API_BASE_URL } from "../config";

// Icône simple pour le bouton d'upgrade
const UpgradeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
      clipRule="evenodd"
    />
  </svg>
);


export default function UserDashboardLayout() {
  const { user, logout } = useAuth();

  const profilePicUrl = user?.profile_picture_url
    ? `${API_BASE_URL}${user.profile_picture_url}`
    : `https://ui-avatars.com/api/?name=${user?.username || '?'}&background=random`;

  if (!user) {
    return <div>Loading user profile...</div>;
  }


  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <aside className="w-64 flex-shrink-0 bg-white p-5 shadow-lg flex flex-col">
        <div className="p-4 border-b border-gray-700">
                    <Logo />
                </div>
        <h1 className="text-2xl font-bold text-blue-700 mb-2">FedIds</h1>
        <p className="text-xs text-gray-500 mb-10 truncate">Welcome, {user.username}!</p>
        
        <nav className="flex flex-col gap-3">
          <NavLink to="/dashboard/overview" className={({isActive}) => `flex items-center px-4 py-2 rounded-md font-semibold text-sm ${isActive ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-blue-100'}`}>
            Detection Overview
          </NavLink>
          <NavLink to="/dashboard/devices" className={({isActive}) => `flex items-center px-4 py-2 rounded-md font-semibold text-sm ${isActive ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-blue-100'}`}>
            My Devices & API Keys
          </NavLink>
          <NavLink to="/dashboard/profile" className={({isActive}) => `flex items-center px-4 py-2 rounded-md font-semibold text-sm ${isActive ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-blue-100'}`}>
            Profile
          </NavLink>
        </nav>

        {user.role === 'user' && (
          <NavLink to="/dashboard/upgrade" className="mt-8 p-3 bg-yellow-400 text-yellow-900 rounded-lg text-center transition hover:bg-yellow-500 font-bold flex items-center justify-center">
             <UpgradeIcon />
             Upgrade to Premium
          </NavLink>
        )}

        {user.role === 'premium' && (
            <div className="mt-8 p-3 bg-blue-100 text-blue-900 rounded-md text-center font-bold">
                ✓ Premium Plan
            </div>
        )}
         {/* --- PROFIL UTILISATEUR (NOUVEAU) --- */}
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-700">
                        <img src={profilePicUrl} alt="Profile" className="h-10 w-10 rounded-full object-cover" />
                        <div className="flex-grow">
                            <p className="font-semibold text-sm text-white truncate">{user.username}</p>
                            <p className="text-xs text-gray-400 capitalize">{user.role} Account</p>
                        </div>
                    </div>
        <div className="mt-auto">
          <button onClick={logout} className="w-full text-left px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 rounded">
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">
        <Routes>
          <Route path="overview" element={<UserDashboard />} />
          <Route path="devices" element={<UserDevices />} />
          <Route path="profile" element={<UserProfile />} />
          <Route path="upgrade" element={<UserUpgradePage />} />
          <Route path="*" element={<Navigate to="overview" replace />} />
        </Routes>
      </main>
    </div>
  );
}