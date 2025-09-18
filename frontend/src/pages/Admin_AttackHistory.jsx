// frontend/src/pages/Admin_AttackHistory.jsx

import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

export default function AdminAttackHistory() {
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // Cet endpoint doit exister dans votre main.py et être protégé par `Depends(get_current_admin_user)`
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
    }, []); // Le tableau vide assure que l'appel ne se fait qu'une fois

    if (isLoading) {
        return <div>Loading attack history...</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Global Attack History</h2>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3 text-left">Timestamp</th>
                                <th className="p-3 text-left">Source IP</th>
                                <th className="p-3 text-left">Attack Type</th>
                                <th className="p-3 text-left">Location</th>
                                <th className="p-3 text-left">Confidence</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {history.map(attack => (
                                <tr key={attack.id} className="hover:bg-gray-50">
                                    <td className="p-3">{new Date(attack.timestamp).toLocaleString()}</td>
                                    <td className="p-3 font-mono">{attack.source_ip}</td>
                                    <td className="p-3 font-semibold">{attack.attack_type}</td>
                                    <td className="p-3">{attack.city || 'N/A'}, {attack.country}</td>
                                    <td className="p-3 font-bold">{(attack.confidence * 100).toFixed(1)}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}