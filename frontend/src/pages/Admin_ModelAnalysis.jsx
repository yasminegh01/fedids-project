// frontend/src/pages/Admin_ModelAnalysis.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import apiClient from '../api/apiClient';
import { useTheme } from '../context/ThemeContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// --- Sous-composant : Affichage des Résultats ---
function AnalysisResultDisplay({ result }) {
    const report = result.report;
    const classNames = Object.keys(report).filter(key => !['accuracy', 'macro avg', 'weighted avg'].includes(key));

    return (
        <div className="mt-8 p-6 border-t-2 border-gray-200 dark:border-gray-700">
            <h4 className="text-xl font-bold text-text-primary mb-4">Analysis Results</h4>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <div>
                    <h5 className="font-semibold text-text-secondary mb-2">Classification Report</h5>
                    <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg bg-bg-primary text-xs">
                        <table className="min-w-full">
                            <thead className="bg-bg-secondary text-left">
                                <tr>
                                    <th className="p-2 font-bold text-text-secondary">Class</th>
                                    <th className="p-2 text-text-secondary">Precision</th>
                                    <th className="p-2 text-text-secondary">Recall</th>
                                    <th className="p-2 text-text-secondary">F1-Score</th>
                                    <th className="p-2 text-text-secondary">Support</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {classNames.map(name => (
                                    <tr key={name}>
                                        <td className='p-2 font-bold text-text-primary'>{name}</td>
                                        <td className='p-2 text-text-secondary'>{report[name].precision.toFixed(2)}</td>
                                        <td className='p-2 text-text-secondary'>{report[name].recall.toFixed(2)}</td>
                                        <td className='p-2 text-text-secondary'>{report[name]['f1-score'].toFixed(2)}</td>
                                        <td className='p-2 text-text-secondary'>{report[name].support}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div>
                    <h5 className="font-semibold text-text-secondary mb-2">Confusion Matrix</h5>
                    <p className="text-xs text-text-secondary mb-2">Y-axis = True Label, X-axis = Predicted Label</p>
                    <img src={`data:image/png;base64,${result.confusion_matrix_b64}`} alt="Confusion Matrix" className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm w-full"/>
                </div>
            </div>
        </div>
    );
}

// --- Composant Principal de la Page ---
export default function AdminModelAnalysis() {
    const [history, setHistory] = useState([]);
    const [chartData, setChartData] = useState({ labels: [], datasets: [] });
    const [file, setFile] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [error, setError] = useState('');
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const { theme } = useTheme();

    const fetchHistory = useCallback(() => {
        setIsLoadingHistory(true);
        apiClient.get('/api/admin/analysis-history')
            .then(res => setHistory(res.data))
            .finally(() => setIsLoadingHistory(false));
    }, []);

    useEffect(() => {
        fetchHistory();
        apiClient.get('/api/admin/fl-history')
            .then(res => {
                const labels = res.data.map(h => `Round ${h.server_round}`);
                const accuracyData = res.data.map(h => h.accuracy);
                setChartData({
                    labels,
                    datasets: [{ label: 'Global Model Accuracy', data: accuracyData }]
                });
            });
    }, [fetchHistory]);

    const viewHistoryItem = async (historyId) => {
        try {
            const res = await apiClient.get(`/api/admin/analysis-history/${historyId}`);
            setAnalysisResult(res.data);
        } catch { setError("Could not load this analysis result."); }
    };

    const handleAnalysisSubmit = async (e) => {
        e.preventDefault();
        if (!file) { setError("Please select a CSV file."); return; }
        setIsAnalyzing(true); setError(''); setAnalysisResult(null);
        const formData = new FormData();
        formData.append("file", file);
        try {
            const res = await apiClient.post('/api/admin/evaluate-model', formData);
            setAnalysisResult(res.data);
            fetchHistory();
        } catch (err) {
            setError(err.response?.data?.detail || "Analysis failed.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const chartOptions = {
        responsive: true, maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true, max: 1,
                ticks: { callback: value => `${(value * 100).toFixed(0)}%`, color: theme === 'light' ? '#4B5563' : '#D1D5DB' },
                grid: { color: theme === 'light' ? '#E5E7EB' : '#374151' }
            },
            x: {
                ticks: { color: theme === 'light' ? '#4B5563' : '#D1D5DB' },
                grid: { display: false }
            }
        },
        plugins: {
            legend: { position: 'top', labels: { color: theme === 'light' ? '#111827' : '#F9FAFB' } }
        }
    };
    
    const themedChartData = {
        ...chartData,
        datasets: chartData.datasets.map(dataset => ({
            ...dataset,
            borderColor: theme === 'light' ? 'rgb(79, 70, 229)' : 'rgb(129, 140, 248)',
            backgroundColor: theme === 'light' ? 'rgba(79, 70, 229, 0.2)' : 'rgba(129, 140, 248, 0.2)',
            tension: 0.1,
            fill: true,
        }))
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-text-primary">Model Performance & Analysis</h1>
                <p className="mt-1 text-text-secondary">Track federated learning progress and evaluate the global model on demand.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 space-y-8">
                    <div className="bg-bg-primary p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold text-text-primary mb-4">Federated Learning History</h2>
                        <div className="h-80"><Line data={themedChartData} options={chartOptions} /></div>
                    </div>

                    <div className="bg-bg-primary p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold text-text-primary">Analysis History</h2>
                        {isLoadingHistory ? <p className="text-text-secondary">Loading history...</p> : (
                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                {history.map(item => (
                                    <div key={item.id} className="flex justify-between items-center py-3">
                                        <div>
                                            <p className="font-semibold text-text-primary">{item.filename}</p>
                                            <p className="text-xs text-text-secondary">{new Date(item.timestamp).toLocaleString()}</p>
                                        </div>
                                        <button onClick={() => viewHistoryItem(item.id)} className="font-semibold text-accent hover:underline">View Results</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-bg-primary p-6 rounded-lg shadow-md sticky top-8">
                        <h2 className="text-xl font-bold text-text-primary mb-4">Evaluate on Demand</h2>
                        <form onSubmit={handleAnalysisSubmit}>
                            <p className="text-sm text-text-secondary mb-4">Upload a test CSV file to get a detailed performance report.</p>
                            <input type="file" accept=".csv" onChange={e => setFile(e.target.files[0])} className="block w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-900/50 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900"/>
                            <button type="submit" disabled={!file || isAnalyzing} className="mt-4 w-full bg-accent hover:bg-accent-hover text-white px-5 py-2 rounded-md text-sm font-semibold disabled:bg-gray-400">
                                {isAnalyzing ? "Analyzing..." : "Run Evaluation"}
                            </button>
                        </form>
                        {error && <p className="mt-4 text-red-600 p-3 bg-red-100 rounded-md text-sm">{error}</p>}
                    </div>
                </div>
            </div>

            {analysisResult && (
                <div className="bg-bg-primary p-6 rounded-lg shadow-md mt-8">
                    <AnalysisResultDisplay result={analysisResult} />
                </div>
            )}
        </div>
    );
}