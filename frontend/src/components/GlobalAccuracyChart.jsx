// frontend/src/components/GlobalAccuracyChart.jsx
import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { useTheme } from '../context/ThemeContext'; // <<< 1. IMPORTER LE HOOK DE THÈME

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function GlobalAccuracyChart() {
    const [chartData, setChartData] = useState({ labels: [], datasets: [{ data: [] }] });
    const [status, setStatus] = useState('connecting');
    const { theme } = useTheme(); // <<< 2. RÉCUPÉRER LE THÈME ACTUEL

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { setStatus('error'); return; }
        const ws = new WebSocket(`ws://127.0.0.1:8000/ws/fl_status?token=${token}`);
        
        ws.onopen = () => setStatus('connected');
        ws.onclose = () => setStatus('disconnected');
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setChartData(prev => ({
                labels: [...prev.labels, `R${data.server_round}`],
                datasets: [{ ...prev.datasets[0], data: [...prev.datasets[0].data, data.accuracy] }]
            }));
        };
        return () => ws.close();
    }, []);
  // === 3. DÉFINIR LES OPTIONS ET LES DONNÉES DU GRAPHIQUE DE MANIÈRE DYNAMIQUE ===
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                min: 0.5, max: 1,
                ticks: { callback: value => `${(value * 100).toFixed(0)}%`, color: theme === 'light' ? '#4B5563' : '#D1D5DB' },
                grid: { color: theme === 'light' ? '#E5E7EB' : '#374151' }
            },
            x: {
                ticks: { color: theme === 'light' ? '#4B5563' : '#D1D5DB' },
                grid: { display: false }
            }
        },
        plugins: {
            legend: { display: false }
        }
    };

    const themedChartData = {
        labels: chartData.labels,
        datasets: [{
            label: 'Global Accuracy',
            data: chartData.datasets[0].data,
            borderColor: theme === 'light' ? 'rgb(34, 197, 94)' : 'rgb(74, 222, 128)',
            backgroundColor: theme === 'light' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(74, 222, 128, 0.2)',
            fill: true,
            tension: 0.1,
        }]
    };
    
    const data = {
        labels: chartData.labels,
        datasets: [{
            label: 'Global Accuracy',
            data: chartData.datasets[0].data,
            borderColor: 'rgb(34, 197, 94)',
        }]
    };
    const statusStyles = {
        connecting: 'text-yellow-500',
        connected: 'text-green-500',
        disconnected: 'text-red-500',
        error: 'text-red-500',
    };
     return (
        <div className="bg-bg-primary p-6 rounded-lg shadow-md h-full">
            <h3 className="font-semibold text-text-primary">
                Global Model Health <span className={statusStyles[status]}>({status})</span>
            </h3>
            <div className="h-64 mt-4">
                <Line data={themedChartData} options={chartOptions} />
            </div>
        </div>
    );
}