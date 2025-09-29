// frontend/src/pages/Admin_UserManagement.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from "react-router-dom";
import apiClient from '../api/apiClient';

// --- Sous-composant : Badge de Statut ---
const StatusBadge = ({ isActive }) => (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
        isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`}>
        {isActive ? 'Active' : 'Suspended'}
    </span>
);

// --- Composant Principal de la Page ---
export default function AdminUserManagement() {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    
    // États pour les filtres et le tri
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('date_desc');

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await apiClient.get('/api/admin/users');
            setUsers(response.data);
        } catch (err) {
            setError('Failed to fetch user data.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleToggleStatus = async (userId) => {
        if (window.confirm("Are you sure you want to change this user's status?")) {
            try {
                await apiClient.put(`/api/admin/users/${userId}/status`);
                fetchUsers(); // Rafraîchir la liste pour voir le changement
            } catch (err) {
                alert("Failed to update user status.");
            }
        }
    };

    // Logique de filtrage et de tri combinée
    const processedUsers = useMemo(() => {
        let filtered = [...users];

        if (searchTerm) {
            filtered = filtered.filter(user =>
                user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (roleFilter !== 'all') {
            filtered = filtered.filter(user => user.role === roleFilter);
        }
        if (statusFilter !== 'all') {
            const isActive = statusFilter === 'active';
            filtered = filtered.filter(user => user.is_active === isActive);
        }
        
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

    if (isLoading) return <div className="text-center p-10 text-text-secondary">Loading users...</div>;
    if (error) return <div className="p-4 bg-red-100 text-red-800 rounded-md">{error}</div>;

    return (
    <div className="space-y-6">
        <h1 className="text-3xl font-bold text-text-primary">User Management</h1>
        
        <div className="bg-bg-primary p-4 rounded-lg shadow-md grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
            <input
                type="text"
                placeholder="Search by username or email..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="md:col-span-2 w-full p-2 border border-gray-300 dark:border-gray-600 bg-bg-primary rounded-md text-text-primary"
            />
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-bg-primary rounded-md text-text-primary">
                <option value="all">All Roles</option><option value="premium">Premium</option><option value="user">User</option>
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-bg-primary rounded-md text-text-primary">
                <option value="all">All Statuses</option><option value="active">Active</option><option value="suspended">Suspended</option>
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-bg-primary rounded-md text-text-primary">
                <option value="date_desc">Newest First</option><option value="date_asc">Oldest First</option><option value="username_asc">Sort by Name (A-Z)</option><option value="username_desc">Sort by Name (Z-A)</option>
            </select>
        </div>

        <div className="bg-bg-primary rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-bg-secondary">
                        <tr className="text-left">
                            <th className="p-3 font-semibold text-text-secondary">User</th>
                            <th className="p-3 font-semibold text-text-secondary">Subscription</th>
                            <th className="p-3 font-semibold text-text-secondary">Devices (Prevention On)</th>
                            <th className="p-3 font-semibold text-text-secondary">Payments</th>
                            <th className="p-3 font-semibold text-text-secondary">Status</th>
                            <th className="p-3 font-semibold text-text-secondary">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {processedUsers.map(user => (
                            <tr key={user.id} className="hover:bg-bg-secondary">
                                <td className="p-3 flex items-center gap-3 whitespace-nowrap">
                                    <img 
                                        src={user.profile_picture_url ? `http://127.0.0.1:8000${user.profile_picture_url}` : `https://ui-avatars.com/api/?name=${user.username}`} 
                                        className="w-10 h-10 rounded-full object-cover" 
                                        alt="Profile"
                                    />
                                    <div>
                                        <p className="font-bold text-text-primary">{user.username}</p>
                                        <p className="text-xs text-text-secondary">Joined: {new Date(user.created_at).toLocaleDateString()}</p>
                                    </div>
                                </td>
                                <td className="p-3 whitespace-nowrap">
                                    <p className="font-semibold capitalize text-text-primary">{user.role}</p>
                                    {user.role === 'premium' && user.subscription_valid_until &&
                                        <p className="text-xs text-text-secondary">
                                            Expires: {new Date(user.subscription_valid_until).toLocaleDateString()}
                                        </p>
                                    }
                                </td>
                                <td className="p-3 text-center">
                                    <span className="font-bold text-text-primary">{user.device_count}</span>
                                    <span className="text-green-500 font-semibold"> ({user.devices_with_prevention_on})</span>
                                </td>
                                <td className="p-3 text-center font-bold text-text-primary">{user.payment_count}</td>
                                <td className="p-3"><StatusBadge isActive={user.is_active} /></td>
                                <td className="p-3 space-x-4 whitespace-nowrap">
                                    <Link to={`/admin/users/${user.id}`} className="font-semibold text-accent hover:underline">Details</Link>
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
    );
}