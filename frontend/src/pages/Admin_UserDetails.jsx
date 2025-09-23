// frontend/src/pages/Admin_UserDetails.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; // Importer Link pour le bouton retour
import apiClient from '../api/apiClient';

// Icônes (vous pouvez les remplacer par une bibliothèque comme react-icons)
const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>;
const InfoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ActivityIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

// Petit composant pour afficher une ligne d'information
const InfoRow = ({ label, value }) => (
    <div className="flex justify-between py-2 border-b border-gray-200">
        <span className="text-gray-500">{label}</span>
        <span className="font-semibold text-gray-800">{value || 'N/A'}</span>
    </div>
);
const StatusIndicator = ({ status }) => {
    const isOnline = status === 'online';
    return (
        <div className="flex items-center gap-2">
            <span className={`relative flex h-3 w-3`}>
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
            </span>
            <span className={`text-sm font-semibold capitalize ${isOnline ? 'text-green-800' : 'text-red-700'}`}>{status || 'Offline'}</span>
        </div>
    );
};
export default function AdminUserDetails() {
    const { userId } = useParams();
    const [user, setUser] = useState(null);
    const [devices, setDevices] = useState([]); 

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = apiClient.get(`/api/admin/users/${userId}`);
        const fetchDeviceData = apiClient.get(`/api/admin/users/${userId}/devices`);

        Promise.all([fetchUserData, fetchDeviceData])
            .then(([userRes, deviceRes]) => {
                setUser(userRes.data);
                // Maintenant, setDevices existe et cette ligne fonctionnera
                setDevices(deviceRes.data); 
            })
            .catch(err => console.error("Failed to fetch user data", err))
            .finally(() => setIsLoading(false));
    }, [userId]);

    if (isLoading) return <div className="text-center p-10">Loading user details...</div>;
    if (!user) return <div className="text-center p-10">User not found.</div>;

    const profilePicUrl = user.profile_picture_url
        ? `http://127.0.0.1:8000${user.profile_picture_url}`
        : `https://ui-avatars.com/api/?name=${user.username}&background=random`;

    return (
        <div className="space-y-6">
            {/* --- En-tête avec bouton Retour et Titre --- */}
            <div>
                <Link to="/admin/users" className="inline-flex items-center text-sm font-semibold text-blue-600 hover:underline mb-4">
                    <BackIcon />
                    Back to User List
                </Link>
                <div className="flex items-center gap-4">
                    <img src={profilePicUrl} alt="Profile" className="w-20 h-20 rounded-full shadow-md" />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{user.username}</h1>
                        <p className="text-gray-500">User ID: {user.id}</p>
                    </div>
                </div>
            </div>
            
            {/* --- Grille d'informations --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Carte d'informations personnelles */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex items-center gap-3 mb-4">
                        <InfoIcon />
                        <h2 className="font-bold text-xl text-gray-700">User Information</h2>
                    </div>
                    <div className="space-y-2">
                        <InfoRow label="Email" value={user.email} />
                        <InfoRow label="Full Name" value={user.full_name} />
                        <InfoRow label="Company" value={user.company} />
                        <InfoRow label="Joined On" value={new Date(user.created_at).toLocaleString()} />
                    </div>
                </div>

                {/* Carte d'activité sur la plateforme */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex items-center gap-3 mb-4">
                        <ActivityIcon />
                        <h2 className="font-bold text-xl text-gray-700">Platform Activity</h2>
                    </div>
                    <div className="space-y-2">
                        <InfoRow label="Role" value={user.role} />
                        <InfoRow label="Subscription Expires" value={user.subscription_valid_until ? new Date(user.subscription_valid_until).toLocaleDateString() : 'N/A'} />
                        <InfoRow label="Total Devices" value={user.device_count} />
                        <InfoRow label="Devices with Prevention" value={user.devices_with_prevention_on} />
                        <InfoRow label="Total Payments" value={user.payment_count} />
                    </div>
                </div>
            </div>

            {/* --- Section future pour la liste des appareils de l'utilisateur --- */}
             {/* === SECTION DES APPAREILS (MISE À JOUR) === */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="font-bold text-xl text-gray-700 mb-4">User's Devices ({devices.length})</h2>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-3 text-left">Device Name</th>
                                <th className="p-3 text-left">API Key</th>
                                <th className="p-3 text-left">Status</th>
                                <th className="p-3 text-center">Prevention Enabled</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {devices.length > 0 ? devices.map(device => (
                                <tr key={device.id} className="hover:bg-gray-50">
                                    <td className="p-3 font-semibold">{device.name}</td>
                                    <td className="p-3 font-mono text-xs">{device.api_key}</td>
                                    <td className="p-3"><StatusIndicator status={device.status_info?.status || 'offline'} /></td>
                                    <td className="p-3 text-center">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                            device.prevention_enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {device.prevention_enabled ? 'ON' : 'OFF'}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="p-4 text-center text-gray-500">This user has no registered devices.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        
            
        </div>
    );
}