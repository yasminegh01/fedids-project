// frontend/src/pages/Admin_FL_Monitoring.jsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import apiClient from '../api/apiClient';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';

// Enregistrement des composants ChartJS
ChartJS.register(
  CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler
);
const initialChartData = {
    labels: [],
    datasets: [
        {
            type: 'line', label: 'Global Accuracy', data: [],
            borderColor: 'rgb(59, 130, 246)', backgroundColor: 'rgba(59, 130, 246, 0.2)',
            yAxisID: 'y_accuracy', tension: 0.2, fill: true,
        },
        {
            type: 'bar', label: 'Global Loss', data: [],
            backgroundColor: 'rgba(239, 68, 68, 0.5)', borderColor: 'rgb(239, 68, 68)',
            yAxisID: 'y_loss',
        },
    ],
};
export default function AdminFLMonitoring() {
    const [isTraining, setIsTraining] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [pid, setPid] = useState(null);
    const [chartData, setChartData] = useState(initialChartData);
    
    // === DÉVELOPPEMENT DE chartOptions ===
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Real-time Federated Learning Performance',
            },
        },
        scales: {
            y_accuracy: {
                type: 'linear',
                display: true,
                position: 'left',
                min: 0,
                max: 1,
                title: {
                    display: true,
                    text: 'Accuracy',
                },
                ticks: {
                    callback: value => `${(value * 100).toFixed(0)}%`,
                },
                grid: {
                    drawOnChartArea: false, // N'affiche que la grille pour l'axe de la perte
                },
            },
            y_loss: {
                type: 'linear',
                display: true,
                position: 'right',
                min: 0,
                title: {
                    display: true,
                    text: 'Loss',
                },
            },
        },
    };

    // === DÉVELOPPEMENT DE checkStatus ===
    const checkStatus = useCallback(async () => {
        try {
            const response = await apiClient.get('/api/admin/training/status');
            setIsTraining(response.data.is_running);
            setPid(response.data.pid);
        } catch (error) {
            console.error("Failed to check training status:", error);
            setIsTraining(false); // En cas d'erreur, on suppose que l'entraînement est arrêté
        } finally {
            setIsLoading(false);
        }
    }, []);
    // Utiliser une référence pour le WebSocket pour éviter les problèmes avec le Mode Strict
    const ws = useRef(null);

    

  useEffect(() => {
        checkStatus();
        const interval = setInterval(checkStatus, 10000);
        
        const token = localStorage.getItem('token');
        if (!token) return;

        // On ne crée la connexion que si elle n'existe pas déjà
        if (!ws.current) {
            ws.current = new WebSocket(`ws://127.0.0.1:8000/ws/fl_status?token=${token}`);
            ws.current.onopen = () => console.log("FL Status WebSocket Connected");
            ws.current.onclose = () => console.log("FL Status WebSocket Disconnected");
            ws.current.onmessage = (event) => {
                const data = JSON.parse(event.data);
                setChartData(prevData => {
                    const newLabels = [...prevData.labels, `R${data.server_round}`];
                    const newAccuracyData = [...prevData.datasets[0].data, data.accuracy];
                    const newLossData = [...prevData.datasets[1].data, data.loss];
                    return {
                        labels: newLabels,
                        datasets: [
                            { ...prevData.datasets[0], data: newAccuracyData },
                            { ...prevData.datasets[1], data: newLossData },
                        ]
                    };
                });
            };
        }

        // La fonction de nettoyage ferme la connexion
        return () => {
            clearInterval(interval);
            if (ws.current) {
                ws.current.close();
                ws.current = null;
            }
        };
    }, [checkStatus]);
    // === FONCTIONNALITÉ COMPLÈTE POUR DÉMARRER L'ENTRAÎNEMENT ===
    const handleStart = async () => {
        if (window.confirm("Are you sure you want to start a new training session?")) {
            try {
                await apiClient.post('/api/admin/training/start');
                // On met à jour l'état immédiatement pour une meilleure réactivité de l'UI
                setIsTraining(true);
                setTimeout(checkStatus, 1000); // On revérifie après 1s pour avoir le PID
            } catch (error) {
                alert("Failed to start training: " + (error.response?.data?.detail || "Server error"));
            }
        }
    };

    // === FONCTIONNALITÉ COMPLÈTE POUR ARRÊTER L'ENTRAÎNEMENT ===
    const handleStop = async () => {
        if (window.confirm("Are you sure you want to stop the current training session?")) {
            try {
                await apiClient.post('/api/admin/training/stop');
                setIsTraining(false); // Mise à jour immédiate de l'UI
                setPid(null);
            } catch (error) {
                alert("Failed to stop training: " + (error.response?.data?.detail || "Server error"));
            }
        }
    };

     return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800">Federated Learning Control Center</h1>
            
            <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                <h3 className="text-xl font-semibold">Training Control</h3>
                <div className="flex items-center gap-4 mt-4">
                    <div className={`px-3 py-1 rounded-full text-sm font-semibold ${isTraining ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        Status: {isLoading ? 'Loading...' : (isTraining ? `Running (PID: ${pid})` : 'Stopped')}
                    </div>
                    <button onClick={handleStart} disabled={isTraining} className="...">Start Training</button>
                    <button onClick={handleStop} disabled={!isTraining} className="...">Stop Training</button>
                </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md mt-6">
                <h3 className="font-semibold">Global Model Performance (Accuracy vs. Loss)</h3>
                <div className="h-96 mt-4">
                    <Bar data={chartData} options={chartOptions} />
                </div>
            </div>
        </div>
    );
}