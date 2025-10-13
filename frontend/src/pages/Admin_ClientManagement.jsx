// frontend/src/pages/Admin_ClientManagement.jsx

import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/apiClient';
import { Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { useTheme } from '../context/ThemeContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

// --- Sous-composant : Modale d'Historique avec Graphique ---
const HistoryModal = ({ client, closeModal }) => {
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { theme } = useTheme();

    useEffect(() => {
        if (client) {
            apiClient.get(`/api/admin/clients/${client.id}/history`)
                .then(res => setHistory(res.data))
                .catch(err => console.error("Failed to fetch client history", err))
                .finally(() => setIsLoading(false));
        }
    }, [client]);

    const chartData = {
        labels: history.map(h => `Round ${h.server_round}`),
        datasets: [
            {
                label: 'Accuracy',
                data: history.map(h => h.accuracy),
                borderColor: theme === 'light' ? 'rgb(34, 197, 94)' : 'rgb(74, 222, 128)',
                backgroundColor: theme === 'light' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(74, 222, 128, 0.2)',
                yAxisID: 'y_accuracy',
                tension: 0.1,
            },
            {
                label: 'Loss',
                data: history.map(h => h.loss),
                borderColor: theme === 'light' ? 'rgb(239, 68, 68)' : 'rgb(248, 113, 113)',
                backgroundColor: theme === 'light' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(248, 113, 113, 0.2)',
                yAxisID: 'y_loss',
                tension: 0.1,
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        interaction: { mode: 'index', intersect: false },
        scales: {
            y_accuracy: {
                type: 'linear', display: true, position: 'left', min: 0, max: 1,
                ticks: { callback: value => `${(value * 100).toFixed(0)}%`, color: theme === 'light' ? '#4B5563' : '#D1D5DB' },
                grid: { color: theme === 'light' ? '#E5E7EB' : '#374151' }
            },
            y_loss: {
                type: 'linear', display: true, position: 'right',
                ticks: { color: theme === 'light' ? '#4B5563' : '#D1D5DB' },
                grid: { drawOnChartArea: false }
            },
            x: {
                ticks: { color: theme === 'light' ? '#4B5563' : '#D1D5DB' },
                grid: { display: false }
            }
        },
        plugins: {
            legend: { labels: { color: theme === 'light' ? '#111827' : '#F9FAFB' } }
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-bg-primary p-6 rounded-lg shadow-xl w-full max-w-3xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-text-primary">Performance History: {client.name}</h3>
                    <button onClick={closeModal} className="text-text-secondary hover:text-red-500 text-2xl">&times;</button>
                </div>
                <div className="h-96">
                    {isLoading ? <p className="p-4 text-center text-text-secondary">Loading history...</p> : <Line data={chartData} options={chartOptions} />}
                </div>
            </div>
        </div>
    );
};

// --- Sous-composant : Badge de Statut ---
const StatusBadge = ({ status }) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      disabled: 'bg-gray-200 text-gray-800',
    };
    return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status] || 'bg-gray-100'}`}>{status}</span>;
};

// --- Composant Principal de la Page ---
export default function AdminClientManagement() {
    const [clients, setClients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedClient, setSelectedClient] = useState(null);
    const [attackStats, setAttackStats] = useState(null);
    const [topClients, setTopClients] = useState([]);

    // Récupération des clients
    const fetchClients = useCallback(() => {
        setIsLoading(true);
        apiClient.get('/api/admin/clients')
            .then(res => setClients(res.data))
            .catch(err => console.error("Failed to fetch clients", err))
            .finally(() => setIsLoading(false));
    }, []);

    // Récupération des stats d’attaques
    const fetchAttackStats = useCallback(() => {
        apiClient.get('/api/admin/attacks/stats-by-type')
            .then(res => {
                setAttackStats({
                    labels: res.data.map(d => d.attack_type),
                    datasets: [{
                        data: res.data.map(d => d.count),
                        backgroundColor: ['#A5B4FC', '#FCA5A5', '#FCD34D', '#6EE7B7', '#93C5FD', '#F9A8D4']
                    }]
                });
            })
            .catch(err => console.error("Failed to fetch attack stats", err));
    }, []);

    // Récupération des meilleurs clients
    const fetchTopClients = useCallback(() => {
        apiClient.get('/api/admin/clients/top-performing')
            .then(res => setTopClients(res.data))
            .catch(err => console.error("Failed to fetch top clients", err));
    }, []);

    useEffect(() => {
        fetchClients();
        fetchAttackStats();
        fetchTopClients();
    }, [fetchClients, fetchAttackStats, fetchTopClients]);

    return (
        <div className="space-y-6">
            {selectedClient && <HistoryModal client={selectedClient} closeModal={() => setSelectedClient(null)} />}

            <h1 className="text-3xl font-bold text-text-primary">FL Client & Attack Analysis</h1>
            <p className="text-text-secondary mt-1">View client performance and analyze attack distributions.</p>

            {/* === SECTION DE STATISTIQUES === */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-bg-primary p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold">Attack Distribution</h3>
                    <div className="max-w-sm mx-auto mt-4">
                        {attackStats ? <Pie data={attackStats} /> : <p>Loading stats...</p>}
                    </div>
                </div>
                <div className="bg-bg-primary p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold">Top Performing Clients</h3>
                    <ul className="mt-4 space-y-2">
                        {topClients.length > 0 ? topClients.map((c, i) => (
                            <li key={c.id} className="flex justify-between p-2 bg-bg-secondary rounded-md">
                                <span className="font-semibold text-text-primary">{i + 1}. {c.name}</span>
                                <span className="text-text-secondary">{(c.avg_accuracy * 100).toFixed(1)}%</span>
                            </li>
                        )) : <p className="text-text-secondary">Loading top clients...</p>}
                    </ul>
                </div>
            </div>

            {/* === TABLEAU DES CLIENTS === */}
            <div className="bg-bg-primary rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    {isLoading ? <p className="p-8 text-center text-text-secondary">Loading clients...</p> : (
                        <table className="min-w-full text-sm">
                            <thead className="bg-bg-secondary">
                                <tr className="text-left">
                                    <th className="p-3 font-semibold text-text-secondary">Client Name</th>
                                    <th className="p-3 font-semibold text-text-secondary">Flower ID</th>
                                    <th className="p-3 font-semibold text-text-secondary">Owner</th>
                                    <th className="p-3 font-semibold text-text-secondary">Status</th>
                                    <th className="p-3 font-semibold text-text-secondary">Registered On</th>
                                    <th className="p-3 font-semibold text-text-secondary">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {clients.map(client => (
                                    <tr key={client.id} className="hover:bg-bg-secondary">
                                        <td className="p-3 font-semibold text-text-primary">{client.name}</td>
                                        <td className="p-3 font-mono text-xs text-text-secondary">{client.flower_id}</td>
                                        <td className="p-3">
                                            <p className="font-semibold text-text-primary">{client.owner_username || 'N/A'}</p>
                                            <p className="text-xs text-text-secondary">{client.owner_email || 'N/A'}</p>
                                        </td>
                                        <td className="p-3"><StatusBadge status={client.status} /></td>
                                        <td className="p-3 text-text-secondary">{new Date(client.registered_at).toLocaleDateString()}</td>
                                        <td className="p-3">
                                            <button onClick={() => setSelectedClient(client)} className="font-semibold text-accent hover:underline">
                                                View Performance
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
