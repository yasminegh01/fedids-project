// frontend/src/pages/Admin_ChatbotAnalytics.jsx

import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import apiClient from '../api/apiClient';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AdminChatbotAnalytics() {
    const [chartData, setChartData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        apiClient.get('/api/admin/chatbot/stats')
            .then(response => {
                const stats = response.data;
                setChartData({
                    labels: stats.map(s => s.question),
                    datasets: [{
                        label: 'Number of Times Asked',
                        data: stats.map(s => s.count),
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                    }]
                });
            })
            .catch(err => console.error("Failed to fetch chatbot stats", err))
            .finally(() => setIsLoading(false));
    }, []);

    const chartOptions = {
        indexAxis: 'y', // Pour avoir des barres horizontales, plus lisibles pour les questions longues
        responsive: true,
        plugins: {
            legend: { display: false },
            title: { display: true, text: 'Top 10 Most Frequent User Questions' }
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Chatbot Analytics</h1>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
                {isLoading && <p>Loading analytics...</p>}
                {chartData ? (
                    <div style={{ height: '60vh' }}>
                        <Bar data={chartData} options={chartOptions} />
                    </div>
                ) : (
                    !isLoading && <p>No chatbot usage data available yet.</p>
                )}
            </div>
        </div>
    );
}