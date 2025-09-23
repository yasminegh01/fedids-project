// frontend/src/pages/Admin_DashboardView.jsx

import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import StatCard from '../components/StatCard'; // On réutilise ce composant
import WorldMap from '../components/WorldMap';
import AttackFeed from '../components/AttackFeed';
import GlobalAccuracyChart from '../components/GlobalAccuracyChart';

export default function AdminDashboardView() {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        // On appelle la bonne route, sans "_stats"
        apiClient.get('/api/admin/dashboard')
            .then(res => setStats(res.data))
            .catch(err => console.error("Failed to fetch admin stats:", err));
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800">Platform Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
                <StatCard label="Total Users" value={stats?.total_users ?? '...'} />
                <StatCard label="Premium Users" value={stats?.premium_users ?? '...'} />
                <StatCard label="Total Devices" value={stats?.total_devices ?? '...'} />
                <StatCard label="Online Devices" value={stats?.online_devices ?? '...'} />
            </div>
            
            {/* On peut aussi inclure la carte et le flux pour une vue globale */}
            <div className="grid lg:grid-cols-5 gap-6 mt-8">
                <div className="lg:col-span-3">
                    <WorldMap />
                </div>
                <div className="lg:col-span-2">
                    <GlobalAccuracyChart />
                </div>
            </div>
        </div>
    );
}