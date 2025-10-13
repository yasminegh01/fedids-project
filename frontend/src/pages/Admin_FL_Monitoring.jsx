// frontend/src/pages/Admin_FL_Monitoring.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { useTheme } from '../context/ThemeContext';
import apiClient from '../api/apiClient';
import { useWebSocket } from '../hooks/useWebSocket';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function AdminFLMonitoring() {
    const [isTraining, setIsTraining] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [pid, setPid] = useState(null);
    const { theme } = useTheme();
    
    // On utilise notre hook pour gérer la connexion WebSocket
    const { messages: flMessages, status: wsStatus } = useWebSocket('/ws/fl_status');

    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [
            { type: 'line', label: 'Global Accuracy', data: [] },
            { type: 'bar', label: 'Global Loss', data: [] }
        ]
    });

    // Ce `useEffect` met à jour le graphique quand de nouveaux messages arrivent
    useEffect(() => {
        if (flMessages.length > 0) {
            const reversedMessages = [...flMessages].reverse();
            setChartData({
                labels: reversedMessages.map(msg => `R${msg.server_round}`),
                datasets: [
                    { ...chartData.datasets[0], data: reversedMessages.map(msg => msg.accuracy) },
                    { ...chartData.datasets[1], data: reversedMessages.map(msg => msg.loss) }
                ]
            });
        }
    }, [flMessages]);

    // Ce `useEffect` vérifie le statut de l'entraînement (polling)
    const checkStatus = useCallback(async () => {
        try {
            const response = await apiClient.get('/api/admin/training/status');
            setIsTraining(response.data.is_running);
            setPid(response.data.pid);
        } catch (error) {
            console.error('Failed to check training status:', error);
            setIsTraining(false);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        checkStatus();
        const interval = setInterval(checkStatus, 10000);
        return () => clearInterval(interval);
    }, [checkStatus]);

    // Fonctions pour démarrer et arrêter l'entraînement
    const handleStart = async () => {
    if (window.confirm('Are you sure you want to start a new training session?')) {
      try {
        await apiClient.post('/api/admin/training/start');
        setIsTraining(true);
        setTimeout(checkStatus, 1000);
      } catch (error) {
        alert('Failed to start training: ' + (error.response?.data?.detail || 'Server error'));
      }
    }
  };

  // === Stop Training ===
  const handleStop = async () => {
    if (window.confirm('Are you sure you want to stop the current training session?')) {
      try {
        await apiClient.post('/api/admin/training/stop');
        setIsTraining(false);
        setPid(null);
      } catch (error) {
        alert('Failed to stop training: ' + (error.response?.data?.detail || 'Server error'));
      }
    }
  };

    // Options et données du graphique (votre code est bon)
    const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        position: 'top',
        labels: { color: theme === 'light' ? '#111827' : '#F9FAFB' }
      },
      title: {
        display: true,
        text: 'Real-time Federated Learning Performance',
        color: theme === 'light' ? '#111827' : '#F9FAFB'
      }
    },
    scales: {
      y_accuracy: {
        type: 'linear',
        display: true,
        position: 'left',
        min: 0,
        max: 1,
        title: { display: true, text: 'Accuracy', color: theme === 'light' ? '#4B5563' : '#D1D5DB' },
        ticks: {
          callback: (value) => `${(value * 100).toFixed(0)}%`,
          color: theme === 'light' ? '#4B5563' : '#D1D5DB'
        },
        grid: { drawOnChartArea: false }
      },
      y_loss: {
        type: 'linear',
        display: true,
        position: 'right',
        min: 0,
        title: { display: true, text: 'Loss', color: theme === 'light' ? '#4B5563' : '#D1D5DB' },
        ticks: { color: theme === 'light' ? '#4B5563' : '#D1D5DB' },
        grid: { color: theme === 'light' ? '#E5E7EB' : '#374151' }
      },
      x: {
        ticks: { color: theme === 'light' ? '#4B5563' : '#D1D5DB' },
        grid: { display: false }
      }
    }
  };

  // === Données avec thème ===
  const themedChartData = {
    labels: chartData.labels,
    datasets: [
      {
        type: 'line',
        label: 'Global Accuracy',
        data: chartData.datasets[0].data,
        borderColor: theme === 'light' ? 'rgb(59, 130, 246)' : 'rgb(96, 165, 250)',
        backgroundColor: theme === 'light' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(96, 165, 250, 0.2)',
        yAxisID: 'y_accuracy',
        tension: 0.2,
        fill: true
      },
      {
        type: 'bar',
        label: 'Global Loss',
        data: chartData.datasets[1].data,
        backgroundColor: theme === 'light' ? 'rgba(239, 68, 68, 0.5)' : 'rgba(248, 113, 113, 0.5)',
        borderColor: theme === 'light' ? 'rgb(239, 68, 68)' : 'rgb(248, 113, 113)',
        yAxisID: 'y_loss'
      }
    ]
  };


    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-text-primary">Federated Learning Control Center</h1>

            {/* Panneau de Contrôle */}
            <div className="bg-bg-primary p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-text-primary">Training Control</h3>
                <div className="flex items-center gap-4 mt-4">
                    <div
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              isTraining ? 'bg-green-100 text-green-800' : 'bg-bg-secondary text-text-primary'
            }`}
          >
            Status: {isLoading ? 'Loading...' : isTraining ? `Running (PID: ${pid})` : 'Stopped'}
          </div>

                    <button
            onClick={handleStart}
            disabled={isTraining}
            className="px-4 py-2 bg-green-600 text-white rounded-md disabled:bg-gray-400"
          >
            Start Training
          </button>
          <button
            onClick={handleStop}
            disabled={!isTraining}
            className="px-4 py-2 bg-red-600 text-white rounded-md disabled:bg-gray-400"
          >
            Stop Training
          </button>

                </div>
            </div>

            {/* Graphique */}
            <div className="bg-bg-primary p-6 rounded-lg shadow-md">
                <h3 className="font-semibold text-text-primary">Global Model Performance (Accuracy vs. Loss)</h3>
                <div className="h-96 mt-4">
                    <Bar data={themedChartData} options={chartOptions} />
                </div>
            </div>
        </div>
    );
}