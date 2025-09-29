import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';

import { 
    ChartBarIcon, 
    UsersIcon, 
    CogIcon, 
    ShieldCheckIcon, 
    DocumentChartBarIcon,
    LifebuoyIcon,
    ArrowLeftOnRectangleIcon,
    ChatBubbleLeftRightIcon // Ajout de l'icône pour le chatbot
} from '@heroicons/react/24/outline';

export default function AdminDashboardLayout() {
    const { logout } = useAuth();

    // La classe de lien utilise maintenant les couleurs sémantiques
    const navLinkClass = ({ isActive }) => 
        `flex items-center gap-3 px-4 py-2 rounded-md font-semibold text-sm transition-colors ${
            isActive 
                ? 'bg-accent text-white' // Couleur d'accentuation pour l'élément actif
                : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
        }`;
        
    return (
       // Le fond principal utilise bg-bg-secondary
       <div className="flex h-screen bg-bg-secondary">
            
            {/* La sidebar utilise bg-bg-primary */}
            <aside className="w-72 bg-bg-primary text-text-primary flex flex-col p-4 shadow-lg">
                
                <div className="p-2 mb-8">
                    <Logo />
                </div>
                
                <nav className="flex-grow space-y-2">
                    <NavLink to="/admin/overview" className={navLinkClass}>
                        <ChartBarIcon className="h-5 w-5" /> Platform Overview
                    </NavLink>
                    <NavLink to="/admin/users" className={navLinkClass}>
                        <UsersIcon className="h-5 w-5" /> User Management
                    </NavLink>
                    <NavLink to="/admin/clients" className={navLinkClass}>
                        <ShieldCheckIcon className="h-5 w-5" /> FL Client Management
                    </NavLink>
                    <NavLink to="/admin/analysis" className={navLinkClass}>
                        <DocumentChartBarIcon className="h-5 w-5" /> Model Analysis
                    </NavLink>
                    <NavLink to="/admin/federated-learning" className={navLinkClass}>
                        <CogIcon className="h-5 w-5" /> FL Control Center
                    </NavLink>
                    <NavLink to="/admin/tickets" className={navLinkClass}>
                        <LifebuoyIcon className="h-5 w-5" /> Support Tickets
                    </NavLink>
                    <NavLink to="/admin/chatbot-analytics" className={navLinkClass}>
                        <ChatBubbleLeftRightIcon className="h-5 w-5" /> Chatbot Analytics
                    </NavLink>
                </nav>

                {/* La bordure s'adapte au thème sombre/clair */}
                <div className="pt-4 mt-auto border-t border-gray-200 dark:border-gray-700 space-y-3">
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