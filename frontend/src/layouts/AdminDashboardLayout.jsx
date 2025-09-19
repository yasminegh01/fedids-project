// frontend/src/layouts/AdminDashboardLayout.jsx
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

export default function AdminDashboardLayout() {
  const { logout } = useAuth();
  const navLinkClass = ({ isActive }) => `... ${isActive ? 'bg-indigo-600' : 'hover:bg-gray-700'}`;

  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-5"><Logo /></div>
        <nav className="p-4 space-y-2">
          <NavLink to="/admin/overview" className={navLinkClass}>Overview</NavLink>
          <NavLink to="/admin/clients" className={navLinkClass}>Client Management</NavLink>
          <NavLink to="/admin/attacks" className={navLinkClass}>Attack History</NavLink>
        </nav>
        <div className="mt-auto p-4"><button onClick={logout} className="...">Logout</button></div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto"><Outlet /></main>
    </div>
  );
}