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
import PremiumChatbot from '../components/PremiumChatbot';

export default function UserDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [isHistoryOpen, setHistoryOpen] = useState(false);
 const [attacks, setAttacks] = useState([]);
    const { messages: attackMessages, status: attackStatus } = useWebSocket('/ws/attacks');

    useEffect(() => {
        apiClient.get('/api/attacks/history')
            .then(res => {
                setAttacks(res.data); // On remplit la liste avec les attaques existantes
            })
            .catch(err => console.error("Failed to load initial attack history:", err))
        apiClient.get('/api/dashboard/stats')
            .then(res => setStats(res.data))
            .catch(err => console.error("Failed to load dashboard stats:", err));
    }, []);

    
        // Si de nouveaux messages arrivent, on les ajoute au début de la liste existante
        useEffect(() => {
        // On utilise le bon nom de variable : 'attackMessages'
        if (attackMessages.length > 0) {
            // On ajoute les nouvelles attaques au début de la liste existante
            setAttacks(prevAttacks => [...attackMessages, ...prevAttacks]);
        }
    }, [attackMessages]); // Se déclenche uniquement quand `newAttackMessages` change

    // === FIN DE LA CORRECTION ===

    if (!user || !stats) {
        return <div className="text-center p-10 text-text-secondary">Loading Dashboard...</div>;
    }
    return (
        <div className="space-y-8">
            <AttackHistoryModal isOpen={isHistoryOpen} onClose={() => setHistoryOpen(false)} />

            <div>
                <h1 className="text-3xl font-bold text-text-primary">Security Operations Center</h1>
                <p className="text-text-secondary">Welcome back, {user.username}.</p>
            </div>
            
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

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 flex flex-col gap-6">
                    {/* On suppose que WorldMap et AttackFeed sont déjà thématiques */}
                    <WorldMap attacks={attackMessages.slice(0, 25)} />
                    <AttackFeed 
                        attacks={attackMessages.slice(0, 5)} 
                        status={attackStatus}
                    />
                </div>
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* On suppose que GlobalAccuracyChart et PremiumChatbot sont déjà thématiques */}
                    <GlobalAccuracyChart />
                    
                    {user.role === 'premium' ? (
                        <PremiumChatbot />
                    ) : (
                        <div className="bg-bg-primary p-6 rounded-lg shadow-md h-full flex flex-col items-center justify-center text-center">
                            <h3 className="font-bold text-lg text-text-primary">Unlock the AI Assistant</h3>
                            <p className="text-sm text-text-secondary mt-2">Upgrade to a Premium account to get real-time security advice from our specialized AI.</p>
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