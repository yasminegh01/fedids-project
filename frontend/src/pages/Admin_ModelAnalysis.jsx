// frontend/src/components/ModelAnalysis.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

// --- Configuration de l'API Client ---
const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
});

// --- Composant d'affichage des résultats ---
function AnalysisResultDisplay({ result }) {
    // Parser le rapport s'il est sous forme de chaîne JSON (pour l'historique)
    const report = typeof result.report === 'string' ? JSON.parse(result.report) : result.report;
    const classNames = Object.keys(report).filter(key => 
        !['accuracy', 'macro avg', 'weighted avg'].includes(key)
    );
    return(
        <div className="mt-8 p-6 border-t-2 border-gray-200">
            <h4 className="text-xl font-bold text-gray-800 mb-4">Résultats de l'analyse</h4>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <div>
                    <h5 className="font-semibold mb-2">Rapport de Classification</h5>
                    <div className="overflow-x-auto border rounded-lg bg-white">
                        <table className="text-xs w-full"><thead className="bg-gray-100 text-left"><tr><th className="p-2 font-bold">Classe</th><th className="p-2">Précision</th><th className="p-2">Rappel</th><th className="p-2">F1-Score</th><th className="p-2">Support</th></tr></thead><tbody>{classNames.map(name => (<tr key={name} className="border-t"><td className='p-2 font-bold'>{name}</td><td className='p-2'>{report[name].precision.toFixed(2)}</td><td className='p-2'>{report[name].recall.toFixed(2)}</td><td className='p-2'>{report[name]['f1-score'].toFixed(2)}</td><td className='p-2'>{report[name].support}</td></tr>))}</tbody></table>
                    </div>
                </div>
                <div>
                    <h5 className="font-semibold mb-2">Matrice de Confusion</h5>
                    <p className="text-xs text-gray-500 mb-2">Axe Y = Vrai Label, Axe X = Prédiction</p>
                    <img src={`data:image/png;base64,${result.confusion_matrix_base64 || result.confusion_matrix_b64}`} alt="Matrice de confusion" className="border rounded-lg shadow-sm"/>
                </div>
            </div>
        </div>
    );
}

// --- Composant Principal de la Page ---
export default function ModelAnalysis() {
    const [file, setFile] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState('');
    const [wsClientId, setWsClientId] = useState(null);
    
    const [history, setHistory] = useState([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [selectedAnalysis, setSelectedAnalysis] = useState(null);

    const fetchHistory = () => {
        setIsLoadingHistory(true);
        apiClient.get('/api/admin/analysis_history')
            .then(res => setHistory(res.data))
            .catch(err => console.error("Could not fetch analysis history:", err))
            .finally(() => setIsLoadingHistory(false));
    };

    useEffect(() => {
        fetchHistory();
        const clientId = uuidv4();
        setWsClientId(clientId);
        const ws = new WebSocket(`ws://127.0.0.1:8000/ws/analysis/${clientId}`);

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setIsAnalyzing(false);
            if (data.status === 'success') {
                setSelectedAnalysis(data.data);
                setError('');
                fetchHistory(); // Rafraîchir l'historique après une nouvelle analyse
            } else {
                setError(data.message || "An error occurred during analysis.");
            }
        };
        return () => ws.close();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) { setError("Veuillez sélectionner un fichier CSV."); return; }
        setIsAnalyzing(true);
        setSelectedAnalysis(null);
        setError('');
        const formData = new FormData();
        formData.append("file", file);
        try {
            await apiClient.post(`/api/admin/analyze_model?client_id=${wsClientId}`, formData);
        } catch (err) {
            setError(err.response?.data?.detail || "Erreur lors de l'envoi du fichier.");
            setIsAnalyzing(false);
        }
    };
    
    const viewHistoryItem = (item) => {
        setSelectedAnalysis({
            report: item.classification_report,
            confusion_matrix_base64: item.confusion_matrix_b64
        });
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Analyse Détaillée du Modèle Global</h2>
            
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <p className="text-sm text-gray-600 mb-4">Chargez un fichier CSV de test pour évaluer le modèle et sauvegarder le résultat.</p>
                <form onSubmit={handleSubmit} className="flex items-center gap-4">
                    <input type="file" accept=".csv" onChange={e => setFile(e.target.files[0])} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                    <button type="submit" disabled={!file || isAnalyzing || !wsClientId} className="bg-indigo-600 text-white px-5 py-2 rounded-md text-sm font-semibold disabled:bg-gray-400">
                        {isAnalyzing ? "Analyse en cours..." : "Lancer l'analyse"}
                    </button>
                </form>
                {isAnalyzing && <div className="mt-6 text-center"><p className="font-semibold text-indigo-600">Le modèle analyse vos données...</p></div>}
                {error && <p className="mt-4 text-red-600 p-3 bg-red-100 rounded-md text-sm">{error}</p>}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Historique des Analyses</h3>
                {isLoadingHistory ? <p>Chargement de l'historique...</p> : (
                    <div className="divide-y divide-gray-200">
                        {history.length > 0 ? history.map(item => (
                            <div key={item.id} className="flex items-center justify-between p-3 hover:bg-gray-50">
                                <div>
                                    <p className="font-semibold">{item.filename}</p>
                                    <p className="text-xs text-gray-500">Analysé le : {new Date(item.timestamp).toLocaleString()}</p>
                                </div>
                                <button onClick={() => viewHistoryItem(item)} className="bg-gray-200 text-gray-800 px-3 py-1 rounded-md text-sm font-semibold hover:bg-gray-300">
                                    Voir les résultats
                                </button>
                            </div>
                        )) : <p className="text-sm text-gray-500">Aucune analyse n'a encore été effectuée.</p>}
                    </div>
                )}
            </div>

            {selectedAnalysis && <AnalysisResultDisplay result={selectedAnalysis} />}
        </div>
    );
}