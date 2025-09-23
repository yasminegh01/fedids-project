// frontend/src/pages/Admin_ModelPerformance.jsx

import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import apiClient from '../api/apiClient';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function AdminModelPerformance() {
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        apiClient.get('/api/admin/fl-global-history')
            .then(res => setHistory(res.data))
            .catch(err => console.error("Failed to fetch FL history", err))
            .finally(() => setIsLoading(false));
    }, []);

    const chartData = {
        labels: history.map(h => `Round ${h.server_round}`),
        datasets: [
            {
                label: 'Global Model Accuracy',
                data: history.map(h => h.accuracy),
                borderColor: 'rgb(79, 70, 229)',
                backgroundColor: 'rgba(79, 70, 229, 0.2)',
                fill: true,
                tension: 0.1,
            },
            {
                label: 'Global Model Loss',
                data: history.map(h => h.loss),
                borderColor: 'rgb(220, 38, 38)',
                backgroundColor: 'rgba(220, 38, 38, 0.2)',
                fill: true,
                tension: 0.1,
            }
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true, max: 1 } },
    };

    if (isLoading) return <div>Loading model performance data...</div>;

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800">Model Performance</h1>
            
            {/* Graphique */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Accuracy & Loss Over Rounds</h2>
                <div className="h-96">
                    <Line data={chartData} options={chartOptions} />
                </div>
            </div>

            {/* Tableau de l'historique */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Round History Details</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-3 text-left">Round</th>
                                <th className="p-3 text-left">Average Accuracy</th>
                                <th className="p-3 text-left">Average Loss</th>
                                <th className="p-3 text-left">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {history.map(h => (
                                <tr key={h.server_round} className="hover:bg-gray-50">
                                    <td className="p-3 font-bold">{h.server_round}</td>
                                    <td className="p-3 font-semibold text-green-600">{h.accuracy ? `${(h.accuracy * 100).toFixed(2)}%` : 'N/A'}</td>
                                    <td className="p-3 font-semibold text-red-600">{h.loss ? h.loss.toFixed(4) : 'N/A'}</td>
                                    <td className="p-3 text-gray-500">{new Date(h.timestamp).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}