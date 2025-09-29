// frontend/src/pages/Admin_DashboardView.jsx
// frontend/src/pages/Admin_DashboardView.jsx

import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { useWebSocket } from '../hooks/useWebSocket'; // On utilise notre hook pour les WebSockets

// Importer les sous-composants
import StatCard from '../components/StatCard';
import WorldMap from '../components/WorldMap';
import AttackFeed from '../components/AttackFeed';
import GlobalAccuracyChart from '../components/GlobalAccuracyChart';

export default function AdminDashboardView() {
    const [stats, setStats] = useState(null);
    
    // Utiliser notre hook WebSocket pour récupérer les données d'attaque en temps réel
    // C'est ce qui rendra la page "live"
    const { messages: attackMessages, status: attackStatus } = useWebSocket('/ws/attacks');

    // Charger les statistiques générales une seule fois au chargement de la page
    useEffect(() => {
        apiClient.get('/api/admin/stats') // On utilise l'endpoint pour les stats globales de l'admin
            .then(res => setStats(res.data))
            .catch(err => console.error("Failed to fetch admin stats:", err));
    }, []);

    return (
        <div className="space-y-8">
            {/* Le titre utilise la couleur de texte primaire du thème */}
            <h1 className="text-3xl font-bold text-text-primary">Platform Overview</h1>
            
            {/* Les StatCards affichent les statistiques globales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Total Users" value={stats?.total_users ?? '...'} />
                <StatCard label="Premium Users" value={stats?.premium_users ?? '...'} />
                <StatCard label="Total Devices" value={stats?.total_devices ?? '...'} />
                <StatCard label="Online Devices" value={stats?.online_devices ?? '...'} />
            </div>
            
            <div className="grid lg:grid-cols-5 gap-6">
                {/* La carte du monde et le flux sont maintenant dans des conteneurs thématiques */}
                <div className="lg:col-span-3 flex flex-col gap-6">
                    
                    {/* Carte du Monde */}
                    <div className="bg-bg-primary p-4 rounded-lg shadow-md">
                        <h3 className="font-semibold text-text-primary mb-2">Real-time Threat Origins</h3>
                        {/* On passe les 25 dernières attaques en prop à la carte */}
                        <WorldMap attacks={attackMessages.slice(0, 25)} />
                    </div>
                    
                    {/* Flux d'Attaques */}
                    <div className="bg-bg-primary p-4 rounded-lg shadow-md">
                        <h3 className="font-semibold text-text-primary mb-2">Global Live Attack Feed</h3>
                        {/* On passe les 5 dernières attaques et le statut de la connexion en prop */}
                        <AttackFeed attacks={attackMessages.slice(0, 5)} status={attackStatus} />
                    </div>
                </div>
                
                {/* Le graphique est dans un conteneur thématique */}
                <div className="lg:col-span-2 bg-bg-primary p-4 rounded-lg shadow-md">
                    <h3 className="font-semibold text-text-primary mb-2">Global Model Health</h3>
                    <GlobalAccuracyChart />
                </div>
            </div>
        </div>
    );
}