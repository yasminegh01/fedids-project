// frontend/src/pages/User_Dashboard.jsx (VERSION FINALE, ASSEMBLÉE ET CORRIGÉE)
// frontend/src/pages/User_Dashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import { useWebSocket } from '../hooks/useWebSocket';

// Importer tous nos sous-composants, qu'on va créer proprement
import StatCard from '../components/StatCard';
import AttackFeed from '../components/AttackFeed';
import WorldMap from '../components/WorldMap';
import AttackHistoryModal from '../components/AttackHistoryModal';
import GlobalAccuracyChart from '../components/GlobalAccuracyChart';
import Chatbot from '../components/Chatbot';
export default function UserDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [isHistoryOpen, setHistoryOpen] = useState(false);

    // Initialiser la référence pour pouvoir appeler une fonction du Chatbot
    const chatbotRef = useRef(null);

    // Utiliser notre hook WebSocket pour récupérer les données d'attaque en temps réel
    const { messages: attackMessages, status: attackStatus } = useWebSocket('/ws/attacks');

    // Charger les statistiques générales une seule fois au chargement de la page
    useEffect(() => {
        apiClient.get('/api/dashboard/stats')
            .then(res => setStats(res.data))
            .catch(err => {
                console.error("Failed to load dashboard stats:", err);
                // Optionnel: Afficher une erreur à l'utilisateur si les stats ne chargent pas
            });
    }, []); // Le tableau de dépendances vide assure que cela ne s'exécute qu'une fois.

    // Fonction de rappel que l'AttackFeed appellera quand on clique sur "Get Advice"
    const handleAdviceRequest = (question) => {
        if (chatbotRef.current) {
            chatbotRef.current.askQuestion(question);
        }
    };

    // Afficher un message de chargement tant que les infos de l'utilisateur ne sont pas prêtes
    if (!user) {
        return (
            <div className="flex justify-center items-center h-full">
                <p>Loading user session...</p>
            </div>
        );
    }

    return (
        <div>
            {/* La Modale est toujours disponible, mais cachée jusqu'à ce que `isHistoryOpen` soit `true` */}
            <AttackHistoryModal isOpen={isHistoryOpen} onClose={() => setHistoryOpen(false)} />

            <h2 className="text-3xl font-bold text-gray-800 mb-6">
                Security Operations Center for {user.username}
            </h2>
            
         
            
            {/* Les cartes de statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard label="Registered Devices" value={stats?.device_count ?? '...'} />
                <StatCard 
                    label="Attacks (7 Days)" 
                    value={stats?.attacks_this_week ?? '...'} 
                    onClick={() => setHistoryOpen(true)} // Ouvre la modale de l'historique
                />
                <StatCard 
                    label="Last Attack Seen" 
                    value={stats?.last_attack_timestamp ? new Date(stats.last_attack_timestamp).toLocaleString() : 'N/A'} 
                />
            </div>

            {/* La grille principale du tableau de bord */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 flex flex-col gap-6">
                    {/* On passe les 20 derniers messages à la carte du monde */}
                    <WorldMap attacks={attackMessages.slice(0, 20)} />
                    {/* On passe les 5 derniers au flux textuel et la fonction de rappel */}
                    <AttackFeed 
                        attacks={attackMessages.slice(0, 5)} 
                        status={attackStatus} 
                        onAdviceClick={handleAdviceRequest} 
                    />
                </div>
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <GlobalAccuracyChart />
                    <Chatbot ref={chatbotRef} />
                </div>
            </div>
        </div>
    );
}
