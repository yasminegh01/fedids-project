// frontend/src/pages/User_Dashboard.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import { useWebSocket } from '../hooks/useWebSocket';

// Importer les sous-composants
import StatCard from '../components/StatCard';
import AttackFeed from '../components/AttackFeed';
import WorldMap from '../components/WorldMap';
import AttackHistoryModal from '../components/AttackHistoryModal';
import GlobalAccuracyChart from '../components/GlobalAccuracyChart';
import PremiumChatbot from '../components/PremiumChatbot'; // On utilise le nouveau chatbot

export default function UserDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [isHistoryOpen, setHistoryOpen] = useState(false);

    // Utiliser notre hook WebSocket pour récupérer les données d'attaque en temps réel
    const { messages: attackMessages, status: attackStatus } = useWebSocket('/ws/attacks');

    // Charger les statistiques générales une seule fois au chargement de la page
    useEffect(() => {
        apiClient.get('/api/dashboard/stats')
            .then(res => setStats(res.data))
            .catch(err => console.error("Failed to load dashboard stats:", err));
    }, []);

    // Afficher un message de chargement tant que les infos ne sont pas prêtes
    if (!user || !stats) {
        return <div className="text-center p-10">Loading Dashboard...</div>;
    }

    return (
        <div className="space-y-8">
            {/* La Modale est toujours disponible, mais cachée */}
            <AttackHistoryModal isOpen={isHistoryOpen} onClose={() => setHistoryOpen(false)} />

            <div>
                <h1 className="text-3xl font-bold text-gray-800">Security Operations Center</h1>
                <p className="text-gray-500">Welcome back, {user.username}.</p>
            </div>
            
            {/* Les cartes de statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="Registered Devices" value={stats.device_count} />
                <StatCard 
                    label="Attacks (Last 7 Days)" 
                    value={stats.attacks_this_week} 
                    onClick={() => setHistoryOpen(true)}
                    isClickable={true}
                />
                <StatCard 
                    label="Last Attack Seen" 
                    value={stats.last_attack_timestamp ? new Date(stats.last_attack_timestamp).toLocaleString() : 'N/A'} 
                />
            </div>

            {/* La grille principale du tableau de bord */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 flex flex-col gap-6">
                    <WorldMap attacks={attackMessages.slice(0, 25)} />
                    <AttackFeed 
                        attacks={attackMessages.slice(0, 5)} 
                        status={attackStatus}
                    />
                </div>
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <GlobalAccuracyChart />
                    
                    {/* === AFFICHAGE CONDITIONNEL DU CHATBOT === */}
                    {user.role === 'premium' ? (
                        <PremiumChatbot />
                    ) : (
                        <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col items-center justify-center text-center">
                            <h3 className="font-bold text-lg text-gray-800">Unlock the AI Assistant</h3>
                            <p className="text-sm text-gray-500 mt-2">Upgrade to a Premium account to get real-time security advice from our specialized AI.</p>
                            <Link to="/dashboard/upgrade" className="mt-4 px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition">
                                Upgrade Now
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}