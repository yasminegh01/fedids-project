import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import apiClient from '../api/apiClient';
import { useTheme } from '../context/ThemeContext'; // <<< 1. IMPORTER LE HOOK DE THÈME

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AdminChatbotAnalytics() {
    const [chartData, setChartData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { theme } = useTheme(); // <<< 2. RÉCUPÉRER LE THÈME ACTUEL

    useEffect(() => {
        apiClient.get('/api/admin/chatbot/stats')
            .then(response => {
                const stats = response.data;
                setChartData({
                    labels: stats.map(s => s.question),
                    datasets: [{
                        label: 'Number of Times Asked',
                        data: stats.map(s => s.count),
                        // On utilisera les couleurs du thème plus tard
                    }]
                });
            })
            .catch(err => console.error("Failed to fetch chatbot stats", err))
            .finally(() => setIsLoading(false));
    }, []);

    // === 3. DÉFINIR LES OPTIONS DU GRAPHIQUE DE MANIÈRE DYNAMIQUE ===
    const chartOptions = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                ticks: {
                    color: theme === 'light' ? '#4B5563' : '#D1D5DB', // Couleur du texte des axes
                },
                grid: {
                    color: theme === 'light' ? '#E5E7EB' : '#374151', // Couleur des lignes de la grille
                }
            },
            x: {
                ticks: {
                    color: theme === 'light' ? '#4B5563' : '#D1D5DB',
                },
                grid: {
                    display: false, // On cache la grille verticale pour la clarté
                }
            }
        },
        plugins: {
            legend: { display: false },
            title: { 
                display: true, 
                text: 'Top 10 Most Frequent User Questions',
                color: theme === 'light' ? '#111827' : '#F9FAFB', // Couleur du titre
                font: { size: 16 }
            }
        }
    };
    
    // On met à jour les couleurs du dataset en fonction du thème
    if (chartData) {
        chartData.datasets[0].backgroundColor = theme === 'light' ? 'rgba(59, 130, 246, 0.6)' : 'rgba(96, 165, 250, 0.6)';
        chartData.datasets[0].borderColor = theme === 'light' ? 'rgb(59, 130, 246)' : 'rgb(96, 165, 250)';
        chartData.datasets[0].borderWidth = 1;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-text-primary">Chatbot Analytics</h1>
            
            <div className="bg-bg-primary p-6 rounded-lg shadow-md">
                {isLoading && <p className="text-center p-10 text-text-secondary">Loading analytics...</p>}
                {chartData ? (
                    <div className="relative" style={{ height: '65vh' }}>
                        <Bar data={chartData} options={chartOptions} />
                    </div>
                ) : (
                    !isLoading && <p className="text-center p-10 text-text-secondary">No chatbot usage data available yet.</p>
                )}
            </div>
        </div>
    );
}