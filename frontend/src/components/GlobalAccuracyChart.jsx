// frontend/src/components/GlobalAccuracyChart.jsx

import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { useTheme } from '../context/ThemeContext';
import { useWebSocket } from '../hooks/useWebSocket'; // <<< 1. IMPORTER LE HOOK WEBSOCKET

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function GlobalAccuracyChart() {
    const { theme } = useTheme();
    
    // === 2. UTILISER LE HOOK POUR SE CONNECTER AU BON CANAL ===
    const { messages, status } = useWebSocket('/ws/fl_status');

    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [{
            label: 'Global Model Accuracy',
            data: [],
        }],
    });

    // === 3. LE USEEFFECT EST MAINTENANT CORRECT ===
    // Il se déclenche à chaque fois que de nouveaux `messages` arrivent
    useEffect(() => {
        if (messages.length > 0) {
            const newLabels = messages.map(msg => `R${msg.server_round}`);
            const newData = messages.map(msg => msg.accuracy);

            setChartData({
                labels: newLabels,
                datasets: [{
                    label: 'Global Model Accuracy',
                    data: newData,
                    borderColor: theme === 'light' ? 'rgb(34, 197, 94)' : 'rgb(74, 222, 128)',
                    backgroundColor: theme === 'light' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(74, 222, 128, 0.2)',
                    fill: true,
                    tension: 0.4,
                }]
            });
        }
    }, [messages, theme]); // On ajoute `theme` pour que les couleurs se mettent à jour

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                min: 0, max: 1,
                ticks: { callback: value => `${(value * 100).toFixed(0)}%`, color: theme === 'light' ? '#4B5563' : '#D1D5DB' },
                grid: { color: theme === 'light' ? '#E5E7EB' : '#374151' }
            },
            x: {
                ticks: { color: theme === 'light' ? '#4B5563' : '#D1D5DB' },
                grid: { display: false }
            }
        },
        plugins: { legend: { display: false } }
    };
    
    const statusStyles = {
        connecting: 'text-yellow-500',
        connected: 'text-green-500',
        disconnected: 'text-red-500',
    };

    return (
        <div className="bg-bg-primary p-6 rounded-lg shadow-md">
            <h3 className="font-semibold text-text-primary">
                Global Model Health <span className={`capitalize ${statusStyles[status]}`}>({status})</span>
            </h3>
            <div className="h-80 mt-4">
                <Line data={chartData} options={chartOptions} />
            </div>
        </div>
    );
}