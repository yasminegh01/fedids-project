import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import { 
    ChartBarIcon, 
    UsersIcon, 
    CogIcon, 
    ShieldCheckIcon, 
    DocumentChartBarIcon,
    LifebuoyIcon,
    ArrowLeftOnRectangleIcon // Pour le logout
} from '@heroicons/react/24/outline';
export default function AdminDashboardLayout() {
    const { logout } = useAuth();
    const navLinkClass = ({ isActive }) => 
        `flex items-center gap-3 px-4 py-2 rounded-md font-semibold text-sm transition-colors ${
            isActive ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
        }`;
        

    return (
       <div className="flex h-screen bg-gray-100">
            <aside className="w-64 bg-gray-800 text-white flex flex-col p-4">
                <div className="p-2 mb-8"><Logo /></div>
                
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
                     {/* === NOUVEAU LIEN TICKETS === */}
                    <NavLink to="/admin/tickets" className={navLinkClass}>
                        <LifebuoyIcon className="h-5 w-5" />
                        Support Tickets
                    </NavLink>
                </nav>
            
                <div className="pt-4 mt-auto border-t border-gray-700">
                    <button 
                        onClick={logout} 
                        className="w-full flex items-center gap-3 px-4 py-2 rounded-md font-semibold text-sm text-red-400 hover:bg-red-500 hover:text-white"
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