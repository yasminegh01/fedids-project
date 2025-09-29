import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';
import { 
    HomeIcon, 
    CpuChipIcon, 
    UserCircleIcon, 
    ArrowUpCircleIcon, 
    LifebuoyIcon,
    ArrowLeftOnRectangleIcon // Pour le logout
} from '@heroicons/react/24/outline';

export default function UserDashboardLayout() {
    const { user, logout } = useAuth();

    // La classe de lien utilise maintenant les couleurs sémantiques
    const navLinkClasses = ({ isActive }) => 
        `flex items-center gap-3 px-4 py-2 rounded-md font-semibold text-sm transition-colors ${
            isActive 
                ? 'bg-accent text-white' // Couleur d'accentuation pour l'élément actif
                : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
        }`;

    if (!user) return <div>Loading session...</div>;

    return (
        // Le fond principal utilise bg-bg-secondary
        <div className="flex h-screen bg-bg-secondary">
            
            {/* La sidebar utilise bg-bg-primary */}
            <aside className="w-72 bg-bg-primary text-text-primary flex flex-col p-4 shadow-lg">
                
                <div className="p-2 mb-8">
                    <Logo />
                </div>
                
                <nav className="flex-grow space-y-2">
                    <NavLink to="/dashboard/overview" className={navLinkClasses}>
                        <HomeIcon className="h-5 w-5" /> Overview
                    </NavLink>
                    <NavLink to="/dashboard/devices" className={navLinkClasses}>
                        <CpuChipIcon className="h-5 w-5" /> My Devices
                    </NavLink>
                    <NavLink to="/dashboard/profile" className={navLinkClasses}>
                        <UserCircleIcon className="h-5 w-5" /> Profile
                    </NavLink>
                    <NavLink to="/dashboard/support" className={navLinkClasses}>
                        <LifebuoyIcon className="h-5 w-5" /> Support
                    </NavLink>
                </nav>
                
                {/* La bordure s'adapte au thème sombre/clair */}
                <div className="pt-4 mt-auto border-t border-gray-200 dark:border-gray-700 space-y-3">
                    {user.role !== 'premium' && (
                        <NavLink 
                            to="/dashboard/upgrade" 
                            className="flex items-center justify-center p-3 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-colors"
                        >
                            <ArrowUpCircleIcon className="h-5 w-5 mr-2" /> Upgrade to Premium
                        </NavLink>
                    )}
                    <ThemeToggle />
                    <button 
                        onClick={logout} 
                        className="w-full flex items-center gap-3 px-4 py-2 rounded-md font-semibold text-sm text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                    >
                        <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                        Logout
                    </button>
                </div>
            </aside>

            <main className="flex-1 p-8 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
}