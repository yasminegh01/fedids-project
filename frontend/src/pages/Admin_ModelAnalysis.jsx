// frontend/src/pages/Admin_ModelAnalysis.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import apiClient from '../api/apiClient';

// Enregistrement des composants ChartJS
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// --- Sous-composant pour afficher les résultats de l'analyse ---
function AnalysisResultDisplay({ result }) {
    const report = result.report;
    const classNames = Object.keys(report).filter(key => !['accuracy', 'macro avg', 'weighted avg'].includes(key));

    return (
        <div className="mt-8 p-6 border-t-2 border-gray-200">
            <h4 className="text-xl font-bold text-gray-800 mb-4">Analysis Results</h4>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <div>
                    <h5 className="font-semibold mb-2">Classification Report</h5>
                    <div className="overflow-x-auto border rounded-lg bg-white text-xs">
                        <table className="min-w-full">
                            <thead className="bg-gray-100 text-left">
                                <tr>
                                    <th className="p-2 font-bold">Class</th>
                                    <th className="p-2">Precision</th>
                                    <th className="p-2">Recall</th>
                                    <th className="p-2">F1-Score</th>
                                    <th className="p-2">Support</th>
                                </tr>
                            </thead>
                            <tbody>
                                {classNames.map(name => (
                                    <tr key={name} className="border-t">
                                        <td className='p-2 font-bold'>{name}</td>
                                        <td className='p-2'>{report[name].precision.toFixed(2)}</td>
                                        <td className='p-2'>{report[name].recall.toFixed(2)}</td>
                                        <td className='p-2'>{report[name]['f1-score'].toFixed(2)}</td>
                                        <td className='p-2'>{report[name].support}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div>
                    <h5 className="font-semibold mb-2">Confusion Matrix</h5>
                    <p className="text-xs text-gray-500 mb-2">Y-axis = True Label, X-axis = Predicted Label</p>
                    <img src={`data:image/png;base64,${result.confusion_matrix_b64}`} alt="Confusion Matrix" className="border rounded-lg shadow-sm w-full"/>
                </div>
            </div>
        </div>
    );
}

// --- Composant Principal ---
export default function AdminModelAnalysis() {
    const [history, setHistory] = useState([]);
    const [flHistory, setFlHistory] = useState([]);
    const [chartData, setChartData] = useState({ labels: [], datasets: [] });
    const [file, setFile] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [error, setError] = useState('');
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);

    // --- Historique des analyses classiques ---
    const fetchHistory = useCallback(() => {
        setIsLoadingHistory(true);
        apiClient.get('/api/admin/analysis-history')
            .then(res => setHistory(res.data))
            .finally(() => setIsLoadingHistory(false));
    }, []);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const viewHistoryItem = async (historyId) => {
        try {
            const res = await apiClient.get(`/api/admin/analysis-history/${historyId}`);
            setAnalysisResult(res.data);
        } catch {
            setError("Could not load this analysis result.");
        }
    };

    // --- Historique FL pour le graphique ---
    useEffect(() => {
        apiClient.get('/api/admin/fl-history')
            .then(res => {
                setFlHistory(res.data);
                const labels = res.data.map(h => `Round ${h.server_round}`);
                const accuracyData = res.data.map(h => h.accuracy);
                setChartData({
                    labels,
                    datasets: [{
                        label: 'Global Model Accuracy',
                        data: accuracyData,
                        borderColor: 'rgb(79, 70, 229)',
                        backgroundColor: 'rgba(79, 70, 229, 0.2)',
                        tension: 0.1,
                        fill: true,
                    }]
                });
            })
            .catch(err => console.error("Failed to fetch FL history:", err));
    }, []);

    const handleFileChange = (e) => setFile(e.target.files[0]);

    const handleAnalysisSubmit = async (e) => {
        e.preventDefault();
        if (!file) { setError("Please select a CSV file."); return; }
        setIsAnalyzing(true); setError(''); setAnalysisResult(null);
        
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await apiClient.post('/api/admin/evaluate-model', formData);
            setAnalysisResult(res.data);
            fetchHistory(); // rafraîchir l'historique
        } catch (err) {
            setError(err.response?.data?.detail || "Analysis failed.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true, max: 1, ticks: { callback: value => `${(value * 100).toFixed(0)}%` } } },
        plugins: { legend: { position: 'top' } }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Model Performance & Analysis</h1>
                <p className="mt-1 text-gray-500">Track federated learning progress and evaluate the global model on demand.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* --- Colonne Principale (Historique FL + Analyses) --- */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold text-gray-700 mb-4">Federated Learning History</h2>
                        <div className="h-80"><Line data={chartData} options={chartOptions} /></div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold">Analysis History</h2>
                        {isLoadingHistory ? <p>Loading history...</p> : (
                            <div className="divide-y">
                                {history.map(item => (
                                    <div key={item.id} className="flex justify-between items-center py-3">
                                        <div>
                                            <p className="font-semibold">{item.filename}</p>
                                            <p className="text-xs text-gray-500">{new Date(item.timestamp).toLocaleString()}</p>
                                        </div>
                                        <button onClick={() => viewHistoryItem(item.id)} className="text-indigo-600 hover:underline">View Results</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* --- Colonne Latérale (Évaluation) --- */}
                <div className="lg:col-span-2">
                    <div className="bg-white p-6 rounded-lg shadow-md sticky top-8">
                        <h2 className="text-xl font-bold text-gray-700 mb-4">Evaluate on Demand</h2>
                        <form onSubmit={handleAnalysisSubmit}>
                            <p className="text-sm text-gray-600 mb-4">Upload a test CSV file to get a detailed performance report.</p>
                            <input type="file" accept=".csv" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
                            <button type="submit" disabled={!file || isAnalyzing} className="mt-4 w-full bg-indigo-600 text-white px-5 py-2 rounded-md text-sm font-semibold disabled:bg-gray-400">
                                {isAnalyzing ? "Analyzing..." : "Run Evaluation"}
                            </button>
                        </form>
                        {error && <p className="mt-4 text-red-600 p-3 bg-red-100 rounded-md text-sm">{error}</p>}
                    </div>
                </div>
            </div>

            {/* --- Résultats d'analyse détaillés --- */}
            {analysisResult && (
                <div className="bg-white p-6 rounded-lg shadow-md mt-8">
                    <AnalysisResultDisplay result={analysisResult} />
                </div>
            )}
        </div>
    );
}
