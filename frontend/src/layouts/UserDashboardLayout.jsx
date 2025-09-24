// frontend/src/layouts/UserDashboardLayout.jsx

import React from 'react';
import { NavLink, Outlet } from 'react-router-dom'; // On a besoin de Outlet
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import { HomeIcon, CpuChipIcon, UserCircleIcon, ArrowUpCircleIcon, LifebuoyIcon } from '@heroicons/react/24/outline';
import PremiumChatbot from '../components/PremiumChatbot'; // Importer le nouveau chatbot

export default function UserDashboardLayout() {
    const { user, logout } = useAuth();
    const navLinkClasses = ({ isActive }) => `flex items-center gap-3 px-4 py-2 rounded-md font-semibold text-sm transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`;

    if (!user) return <div>Loading...</div>;

    return (
        <div className="flex h-screen bg-gray-100">
            <aside className="w-64 bg-gray-800 text-white flex flex-col p-4">
                <div className="p-2 mb-8"><Logo /></div>
                
                <nav className="flex-grow space-y-2">
                    <NavLink to="/dashboard/overview" className={navLinkClasses}><HomeIcon className="h-5 w-5" /> Overview</NavLink>
                    <NavLink to="/dashboard/devices" className={navLinkClasses}><CpuChipIcon className="h-5 w-5" /> My Devices</NavLink>
                    <NavLink to="/dashboard/profile" className={navLinkClasses}><UserCircleIcon className="h-5 w-5" /> Profile</NavLink>
                    <NavLink to="/dashboard/support" className={navLinkClasses}><LifebuoyIcon className="h-5 w-5" /> Support</NavLink>
                </nav>
                
                <div className="mt-auto space-y-4">
                    {user.role !== 'premium' && (
                        <NavLink to="/dashboard/upgrade" className="flex items-center justify-center p-3 bg-yellow-400 text-yellow-900 rounded-lg font-bold">
                            <ArrowUpCircleIcon className="h-5 w-5 mr-2" /> Upgrade
                        </NavLink>
                    )}
                    <button onClick={logout} className="w-full ...">Logout</button>
                </div>
            </aside>

            <main className="flex-1 p-8 overflow-y-auto">
                {/* C'est ici que les pages enfants (UserDashboard, UserSupportPage, etc.) seront affichées */}
                <Outlet />
            </main>
        </div>
    );
}