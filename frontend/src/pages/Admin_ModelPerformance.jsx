// frontend/src/pages/Admin_ModelPerformance.jsx
import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import apiClient from '../api/apiClient';
import { useTheme } from '../context/ThemeContext'; // <<< IMPORTER LE HOOK DE THÈME

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function AdminModelPerformance() {
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { theme } = useTheme(); // <<< RÉCUPÉRER LE THÈME ACTUEL

    useEffect(() => {
        apiClient.get('/api/admin/fl-global-history')
            .then(res => setHistory(res.data))
            .catch(err => console.error("Failed to fetch FL history", err))
            .finally(() => setIsLoading(false));
    }, []);

    // === OPTIONS DU GRAPHIQUE DYNAMIQUES ===
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { color: theme === 'light' ? '#4B5563' : '#D1D5DB' },
                grid: { color: theme === 'light' ? '#E5E7EB' : '#374151' }
            },
            x: {
                ticks: { color: theme === 'light' ? '#4B5563' : '#D1D5DB' },
                grid: { display: false }
            }
        },
        plugins: {
            legend: { position: 'top', labels: { color: theme === 'light' ? '#111827' : '#F9FAFB' } },
            title: { display: true, text: 'Accuracy & Loss Over Rounds', color: theme === 'light' ? '#111827' : '#F9FAFB' }
        }
    };

    // On met à jour les couleurs du dataset en fonction du thème
    const chartData = {
        labels: history.map(h => `Round ${h.server_round}`),
        datasets: [
            {
                label: 'Global Model Accuracy',
                data: history.map(h => h.accuracy),
                borderColor: theme === 'light' ? 'rgb(34, 197, 94)' : 'rgb(74, 222, 128)',
                backgroundColor: theme === 'light' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(74, 222, 128, 0.2)',
                fill: true,
                tension: 0.1,
            },
            {
                label: 'Global Model Loss',
                data: history.map(h => h.loss),
                borderColor: theme === 'light' ? 'rgb(239, 68, 68)' : 'rgb(248, 113, 113)',
                backgroundColor: theme === 'light' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(248, 113, 113, 0.2)',
                fill: true,
                tension: 0.1,
            }
        ],
    };

    if (isLoading) return <div className="text-center p-10 text-text-secondary">Loading model performance data...</div>;

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-text-primary">Model Performance</h1>
            
            <div className="bg-bg-primary p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-text-primary">Accuracy & Loss Over Rounds</h2>
                <div className="h-96">
                    <Line data={chartData} options={chartOptions} />
                </div>
            </div>

            <div className="bg-bg-primary p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-text-primary">Round History Details</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-bg-secondary">
                            <tr>
                                <th className="p-3 text-left font-semibold text-text-secondary">Round</th>
                                <th className="p-3 text-left font-semibold text-text-secondary">Average Accuracy</th>
                                <th className="p-3 text-left font-semibold text-text-secondary">Average Loss</th>
                                <th className="p-3 text-left font-semibold text-text-secondary">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {history.map(h => (
                                <tr key={h.server_round} className="hover:bg-bg-secondary">
                                    <td className="p-3 font-bold text-text-primary">{h.server_round}</td>
                                    <td className="p-3 font-semibold text-green-500">{h.accuracy ? `${(h.accuracy * 100).toFixed(2)}%` : 'N/A'}</td>
                                    <td className="p-3 font-semibold text-red-500">{h.loss ? h.loss.toFixed(4) : 'N/A'}</td>
                                    <td className="p-3 text-text-secondary">{new Date(h.timestamp).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}