// frontend/src/layouts/AdminDashboardLayout.jsx

import React from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// Import the admin pages
import AdminDashboardView from '../pages/Admin_DashboardView';
import AdminClientManagement from '../pages/Admin_ClientManagement';
import AdminModelAnalysis from '../pages/Admin_ModelAnalysis';

export default function AdminDashboardLayout() {
    const { logout } = useAuth(); // Récupérer la fonction logout
  const handleLogout = () => {
    // This logic should ideally be moved to a global AuthContext
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* --- Sidebar for Admin --- */}
      <aside className="w-64 flex-shrink-0 bg-white p-5 shadow-lg flex flex-col">
        <h1 className="text-2xl font-bold text-blue-700 mb-10">FedIds Admin</h1>
        <nav className="flex flex-col gap-3">
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              `block px-4 py-2 rounded-md font-semibold text-sm ${isActive ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-blue-100'}`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/admin/clients"
            className={({ isActive }) =>
              `block px-4 py-2 rounded-md font-semibold text-sm ${isActive ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-blue-100'}`
            }
          >
            Client Management
          </NavLink>
          <NavLink
            to="/admin/analysis"
            className={({ isActive }) =>
              `block px-4 py-2 rounded-md font-semibold text-sm ${isActive ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-blue-100'}`
            }
          >
            Model Analysis
          </NavLink>
        </nav>
        <div className="mt-auto">
          <button
            onClick={logout} // On appelle la fonction logout du contexte
            className="w-full text-left px-4 py-2 rounded-md font-semibold text-sm text-red-600 hover:bg-red-100"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* --- Main Content Area for Admin --- */}
      <main className="flex-1 overflow-y-auto p-8">
        <Routes>
          <Route path="dashboard" element={<AdminDashboardView />} />
          <Route path="clients" element={<AdminClientManagement />} />
          <Route path="analysis" element={<AdminModelAnalysis />} />
          {/* Default route for admin section */}
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}