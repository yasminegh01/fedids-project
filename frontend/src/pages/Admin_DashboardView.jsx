// frontend/src/components/DashboardView.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import Chatbot from '../components/Chatbot'; // Assurez-vous que l'import est en haut

// Enregistrement des composants ChartJS pour que le graphique fonctionne
ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler
);

// Helper centralisé pour les appels à l'API
const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
});

// Petit composant réutilisable pour les cartes de statistiques
const StatCard = ({ label, value, colorClass = 'text-gray-800' }) => (
  <div className="bg-white p-6 rounded-lg shadow-md text-center transform hover:scale-105 transition-transform duration-300">
    <p className="text-sm text-gray-500 font-semibold uppercase">{label}</p>
    <p className={`text-4xl font-bold mt-2 ${colorClass}`}>{value}</p>
  </div>
);

// Composant principal du tableau de bord
export default function DashboardView() {
  const [stats, setStats] = useState({ total_clients: 0, active_clients: 0 });
  const [flStatus, setFlStatus] = useState({ server_round: 0, accuracy: 0.0 });
  const [recentAttacks, setRecentAttacks] = useState([]);

  // État pour les données du graphique
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{
      label: 'Global Model Accuracy',
      data: [],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      tension: 0.1,
      fill: true,
    }],
  });

  // Options de configuration pour le graphique
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true, max: 1, ticks: { callback: value => `${(value * 100).toFixed(0)}%` } },
      x: { grid: { display: false } }
    },
    plugins: { legend: { display: false } }
  };
  
  // Hook `useEffect` pour gérer les connexions (API et WebSockets)
  useEffect(() => {
    // 1. Récupérer les statistiques initiales au chargement
    apiClient.get('/api/admin/dashboard_stats')
      .then(res => setStats(res.data))
      .catch(err => console.error("Failed to fetch dashboard stats:", err));

    // 2. Établir la connexion WebSocket pour le statut de l'apprentissage fédéré
    const flWs = new WebSocket(`ws://127.0.0.1:8000/ws/fl_status`);
    flWs.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setFlStatus(data);
      // Mettre à jour les données du graphique avec le nouveau round
      setChartData(prevData => {
        const newLabels = [...prevData.labels, `R${data.server_round}`];
        const newData = [...prevData.datasets[0].data, data.accuracy];
        return {
          ...prevData,
          labels: newLabels,
          datasets: [{ ...prevData.datasets[0], data: newData }]
        };
      });
    };

    // 3. Établir la connexion WebSocket pour les alertes d'attaques en temps réel
    const attackWs = new WebSocket(`ws://127.0.0.1:8000/ws/attacks`);
    attackWs.onmessage = (event) => {
      const newAttack = JSON.parse(event.data);
      // Ajouter un horodatage lisible au moment de la réception
      newAttack.timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit'});
      setRecentAttacks(prevAttacks => [newAttack, ...prevAttacks].slice(0, 5)); // Conserver seulement les 5 dernières alertes
    };
    
    // 4. Fonction de nettoyage : fermer les connexions WebSocket en quittant la page
    return () => {
      flWs.close();
      attackWs.close();
    };
  }, []); // Le tableau vide `[]` signifie que cet effet ne s'exécute qu'une seule fois au montage du composant

  // Rendu du composant (JSX)
  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">System Dashboard</h2>
      
      {/* Section des cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard label="Federated Round" value={flStatus.server_round} colorClass="text-indigo-600" />
        <StatCard label="Global Accuracy" value={`${(flStatus.accuracy * 100).toFixed(2)}%`} colorClass="text-green-600" />
        <StatCard label="Total Clients" value={stats.total_clients} />
        <StatCard label="Active Clients" value={stats.active_clients} />
      </div>

      {/* Grille principale pour le contenu (graphique, alertes et chatbot) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
        {/* Zone de contenu principale (3 colonnes de large) */}
        <div className="lg:col-span-3 flex flex-col gap-6">

            {/* Carte du graphique de précision */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="font-semibold text-gray-700 mb-4">Model Accuracy Over Rounds</h3>
                <div className="h-80">
                    <Line data={chartData} options={chartOptions} />
                </div>
            </div>

            {/* Carte du flux d'attaques en temps réel */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="font-semibold text-gray-700 mb-4">Live Attack Feed</h3>
                <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                    {recentAttacks.length > 0 ? (
                        recentAttacks.map((attack, index) => (
                            <div key={index} className="p-3 bg-red-50 border-l-4 border-red-500 rounded animate-pulse-once">
                                <p className="font-bold text-red-800">{attack.attack_type}</p>
                                <p className="text-sm text-gray-600">
                                    From: <span className="font-mono">{attack.source_ip}</span> at {attack.timestamp}
                                </p>
                                {/* S'assurer que 'confidence' existe avant de l'afficher */}
                                {attack.confidence && (
                                    <p className="text-xs text-red-600">
                                        Confidence: {(attack.confidence * 100).toFixed(1)}%
                                    </p>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500">No recent attacks detected. System is secure.</p>
                    )}
                </div>
            </div>
        </div>

        {/* Colonne latérale pour le Chatbot (2 colonnes de large) */}
        <div className="lg:col-span-2">
            <Chatbot />
        </div>

      </div>
    </div>
  );
}