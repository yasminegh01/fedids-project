// frontend/src/pages/Admin_ClientManagement.jsx

import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/apiClient';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend,
} from 'chart.js';

// Enregistrement des composants ChartJS
ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend
);

// --- Sous-composant : Modale d'Historique avec Graphique ---
const HistoryModal = ({ client, closeModal }) => {
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

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
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                yAxisID: 'y_accuracy',
            },
            {
                label: 'Loss',
                data: history.map(h => h.loss),
                borderColor: 'rgb(239, 68, 68)',
                backgroundColor: 'rgba(239, 68, 68, 0.5)',
                yAxisID: 'y_loss',
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        scales: {
            y_accuracy: { type: 'linear', display: true, position: 'left', min: 0, max: 1, ticks: { callback: value => `${(value * 100).toFixed(0)}%` } },
            y_loss: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false } }
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-3xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Performance History for: {client.name}</h3>
                    <button onClick={closeModal} className="text-gray-500 hover:text-red-600 text-2xl">&times;</button>
                </div>
                <div className="h-96">
                    {isLoading ? <p className="p-4 text-center">Loading history...</p> : <Line data={chartData} options={chartOptions} />}
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

    const fetchClients = useCallback(() => {
        setIsLoading(true);
        apiClient.get('/api/admin/clients')
            .then(res => setClients(res.data))
            .catch(err => console.error("Failed to fetch clients", err))
            .finally(() => setIsLoading(false));
    }, []);

    useEffect(() => { fetchClients(); }, [fetchClients]);

    return (
        <div>
            {selectedClient && <HistoryModal client={selectedClient} closeModal={() => setSelectedClient(null)} />}

            <h1 className="text-3xl font-bold text-gray-800">FL Client Management</h1>
            <p className="text-gray-600 mt-1">View the status and performance of each client in the federated network.</p>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden mt-6">
                <div className="overflow-x-auto">
                    {isLoading ? <p className="p-8 text-center">Loading clients...</p> : (
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr className="text-left">
                                    <th className="p-3">Client Name</th>
                                    <th className="p-3">Flower ID</th>
                                    <th className="p-3">Owner</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3">Registered On</th>
                                    <th className="p-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {clients.map(client => (
                                    <tr key={client.id} className="hover:bg-gray-50">
                                        <td className="p-3 font-semibold">{client.name}</td>
                                        <td className="p-3 font-mono text-xs">{client.flower_id}</td>
                                        <td className="p-3">
                                            <p className="font-semibold">{client.owner_username || 'N/A'}</p>
                                            <p className="text-xs text-gray-500">{client.owner_email || 'N/A'}</p>
                                        </td>
                                        <td className="p-3"><StatusBadge status={client.status} /></td>
                                        <td className="p-3">{new Date(client.registered_at).toLocaleDateString()}</td>
                                        <td className="p-3">
                                            <button onClick={() => setSelectedClient(client)} className="font-semibold text-blue-600 hover:underline">
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