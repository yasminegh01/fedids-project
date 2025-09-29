// frontend/src/pages/Admin_AttackHistory.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

export default function AdminAttackHistory() {
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        apiClient.get('/api/admin/attacks/history')
            .then(response => {
                setHistory(response.data);
            })
            .catch(err => {
                setError('Failed to fetch attack history.');
                console.error(err);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    if (isLoading) {
        return <div className="text-center p-10 text-text-secondary">Loading global attack history...</div>;
    }

    if (error) {
        return <div className="p-4 bg-red-100 text-red-800 rounded-md">{error}</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-text-primary">Global Attack History</h1>
            
            {/* Le conteneur principal utilise maintenant les couleurs du thème */}
            <div className="bg-bg-primary rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        {/* L'en-tête du tableau utilise les couleurs du thème */}
                        <thead className="bg-bg-secondary">
                            <tr>
                                <th className="p-3 text-left font-semibold text-text-secondary">Timestamp</th>
                                <th className="p-3 text-left font-semibold text-text-secondary">Source IP</th>
                                <th className="p-3 text-left font-semibold text-text-secondary">Attack Type</th>
                                <th className="p-3 text-left font-semibold text-text-secondary">Location</th>
                                <th className="p-3 text-left font-semibold text-text-secondary">Confidence</th>
                            </tr>
                        </thead>
                        {/* La bordure du corps du tableau s'adapte au thème */}
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {history.length > 0 ? history.map(attack => (
                                // Le survol de la ligne utilise les couleurs du thème
                                <tr key={attack.id} className="hover:bg-bg-secondary">
                                    <td className="p-3 text-text-secondary">{new Date(attack.timestamp).toLocaleString()}</td>
                                    <td className="p-3 font-mono text-text-primary">{attack.source_ip}</td>
                                    <td className="p-3 font-semibold text-text-primary">{attack.attack_type}</td>
                                    <td className="p-3 text-text-secondary">{attack.city || 'N/A'}{attack.country ? `, ${attack.country}` : ''}</td>
                                    <td className="p-3 font-bold text-accent">{(attack.confidence * 100).toFixed(1)}%</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="p-6 text-center text-text-secondary">
                                        No attack data available yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}