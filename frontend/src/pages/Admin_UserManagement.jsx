// frontend/src/pages/Admin_UserManagement.jsx

import React, { useState, useEffect, useCallback,useMemo } from 'react';
import apiClient from '../api/apiClient';
import { Link } from "react-router-dom";

const API_BASE_URL = "http://127.0.0.1:8000";

// Petit composant pour afficher un badge de statut coloré
const StatusBadge = ({ isActive }) => (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
        isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`}>
        {isActive ? 'Active' : 'Suspended'}
    </span>
);
export default function AdminUserManagement() {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState(''); // 

    const fetchUsers = useCallback(async () => {
        try {
            const response = await apiClient.get('/api/admin/users');
            setUsers(response.data);
        } catch (err) {
            setError('Failed to fetch user data.');
        } finally {
            setIsLoading(false);
        }
    }, []);
    const [roleFilter, setRoleFilter] = useState('all'); // 'all', 'premium', 'user'
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'suspended'
    const [sortBy, setSortBy] = useState('username_asc'); // 'username_asc', 'username_desc', 'date_asc', 'date_desc'

    // Charger les données au premier rendu de la page
     useEffect(() => {
        apiClient.get('/api/admin/users')
            .then(res => setUsers(res.data))
            .finally(() => setIsLoading(false));
    }, []);

    // Fonction pour gérer le clic sur le bouton de suspension/réactivation
    const handleToggleStatus = async (userId) => {
        if (window.confirm("Are you sure you want to change this user's status?")) {
            try {
                await apiClient.put(`/api/admin/users/${userId}/status`);
                // Après le succès, on rafraîchit la liste pour voir le changement
                fetchUsers();
            } catch (err) {
                alert("Failed to update user status.");
            }
        }
    };
// Filtrer les utilisateurs en fonction du terme de recherche
    const filteredUsers = useMemo(() => {
        if (!searchTerm) return users;
        return users.filter(user =>
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);
    
    const processedUsers = useMemo(() => {
        let filtered = [...users];

        // 1. Filtrage par recherche
        if (searchTerm) {
            filtered = filtered.filter(user =>
                user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        // 2. Filtrage par rôle
        if (roleFilter !== 'all') {
            filtered = filtered.filter(user => user.role === roleFilter);
        }
        // 3. Filtrage par statut
        if (statusFilter !== 'all') {
            const isActive = statusFilter === 'active';
            filtered = filtered.filter(user => user.is_active === isActive);
        }
        // 4. Tri
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'username_asc': return a.username.localeCompare(b.username);
                case 'username_desc': return b.username.localeCompare(a.username);
                case 'date_asc': return new Date(a.created_at) - new Date(b.created_at);
                case 'date_desc': return new Date(b.created_at) - new Date(a.created_at);
                default: return 0;
            }
        });

        return filtered;
    }, [users, searchTerm, roleFilter, statusFilter, sortBy]);
    if (isLoading) return <div>Loading users...</div>;
    if (error) return <div className="text-red-500">{error}</div>;
    return (
    <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
        
        {/* === PANNEAU DE FILTRES ET DE RECHERCHE === */}
        <div className="bg-white p-4 rounded-lg shadow-md grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
            <input
                type="text"
                placeholder="Search by username or email..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="md:col-span-2 w-full p-2 border border-gray-300 rounded-md"
            />
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md bg-white">
                <option value="all">All Roles</option>
                <option value="premium">Premium</option>
                <option value="user">User</option>
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md bg-white">
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md bg-white">
                <option value="username_asc">Sort by Name (A-Z)</option>
                <option value="username_desc">Sort by Name (Z-A)</option>
                <option value="date_desc">Newest First</option>
                <option value="date_asc">Oldest First</option>
            </select>
        </div>

        {/* === TABLEAU DES UTILISATEURS === */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr className="text-left">
                            <th className="p-3 font-semibold text-gray-600">User</th>
                            <th className="p-3 font-semibold text-gray-600">Subscription</th>
                            <th className="p-3 font-semibold text-gray-600">Devices (Prevention On)</th>
                            <th className="p-3 font-semibold text-gray-600">Payments</th>
                            <th className="p-3 font-semibold text-gray-600">Status</th>
                            <th className="p-3 font-semibold text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {processedUsers.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="p-3 flex items-center gap-3 whitespace-nowrap">
                                    <img 
                                        src={user.profile_picture_url ? `http://127.0.0.1:8000${user.profile_picture_url}` : `https://ui-avatars.com/api/?name=${user.username}`} 
                                        className="w-10 h-10 rounded-full object-cover" 
                                        alt="Profile"
                                    />
                                    <div>
                                        <p className="font-bold text-gray-900">{user.username}</p>
                                        <p className="text-xs text-gray-500">Joined: {new Date(user.created_at).toLocaleDateString()}</p>
                                    </div>
                                </td>
                                <td className="p-3 whitespace-nowrap">
                                    <p className="font-semibold capitalize">{user.role}</p>
                                    {user.role === 'premium' && user.subscription_valid_until &&
                                        <p className="text-xs text-gray-500">
                                            Expires: {new Date(user.subscription_valid_until).toLocaleDateString()}
                                        </p>
                                    }
                                </td>
                                <td className="p-3 text-center">
                                    <span className="font-bold">{user.device_count}</span>
                                    <span className="text-green-600 font-semibold"> ({user.devices_with_prevention_on})</span>
                                </td>
                                <td className="p-3 text-center font-bold">{user.payment_count}</td>
                                <td className="p-3"><StatusBadge isActive={user.is_active} /></td>
                                <td className="p-3 space-x-4 whitespace-nowrap">
                                    <Link to={`/admin/users/${user.id}`} className="font-semibold text-blue-600 hover:underline">Details</Link>
                                    <button onClick={() => handleToggleStatus(user.id)} className="font-semibold text-indigo-600 hover:underline">
                                        {user.is_active ? 'Suspend' : 'Reactivate'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
               </div>
        </div>
    );}