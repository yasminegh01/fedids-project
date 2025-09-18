// frontend/src/components/GlobalAccuracyChart.jsx
import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function GlobalAccuracyChart() {
    const [chartData, setChartData] = useState({ labels: [], datasets: [{ data: [] }] });
    const [status, setStatus] = useState('connecting');

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

    const data = {
        labels: chartData.labels,
        datasets: [{
            label: 'Global Accuracy',
            data: chartData.datasets[0].data,
            borderColor: 'rgb(34, 197, 94)',
        }]
    };
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-md h-full">
            <h3 className="font-semibold text-gray-700">Global Model Health <span className={status === 'connected' ? 'text-green-500' : 'text-red-500'}>({status})</span></h3>
            <div className="h-64 mt-4">
                <Line data={data} options={{ responsive: true, maintainAspectRatio: false, scales: {y: {min: 0.5, max: 1}} }}/>
            </div>
        </div>
    );
}