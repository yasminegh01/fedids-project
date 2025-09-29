import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

export default function AttackHistoryModal({ isOpen, onClose }) {
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            apiClient.get('/api/attacks/history')
                .then(res => setHistory(res.data))
                .catch(err => console.error("Failed to fetch attack history", err))
                .finally(() => setIsLoading(false));
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        // L'arrière-plan semi-transparent reste le même
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            
            {/* La modale utilise les couleurs du thème */}
            <div className="bg-bg-primary p-6 rounded-lg shadow-xl w-full max-w-4xl flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-text-primary">Your Attack History</h3>
                    <button onClick={onClose} className="text-text-secondary hover:text-red-500 text-2xl font-bold">&times;</button>
                </div>
                
                <div className="overflow-y-auto max-h-[70vh]">
                    {isLoading ? (
                        <p className="text-center p-8 text-text-secondary">Loading history...</p>
                    ) : (
                        <table className="min-w-full text-sm">
                            <thead className="bg-bg-secondary sticky top-0">
                                <tr>
                                    <th className="p-3 text-left font-semibold text-text-secondary">Timestamp</th>
                                    <th className="p-3 text-left font-semibold text-text-secondary">Source IP</th>
                                    <th className="p-3 text-left font-semibold text-text-secondary">Attack Type</th>
                                    <th className="p-3 text-left font-semibold text-text-secondary">Location</th>
                                    <th className="p-3 text-left font-semibold text-text-secondary">Confidence</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {history.map(attack => (
                                    <tr key={attack.id} className="hover:bg-bg-secondary">
                                        <td className="p-3 text-text-secondary">{new Date(attack.timestamp).toLocaleString()}</td>
                                        <td className="p-3 font-mono text-text-primary">{attack.source_ip}</td>
                                        <td className="p-3 font-semibold text-text-primary">{attack.attack_type}</td>
                                        <td className="p-3 text-text-secondary">{attack.city || 'N/A'}{attack.country ? `, ${attack.country}` : ''}</td>
                                        <td className="p-3 font-bold text-accent">{(attack.confidence * 100).toFixed(1)}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}