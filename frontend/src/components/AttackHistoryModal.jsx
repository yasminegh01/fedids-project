// frontend/src/components/AttackHistoryModal.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

export default function AttackHistoryModal({ isOpen, onClose }) {
    const [history, setHistory] = useState([]);
    useEffect(() => { if (isOpen) { apiClient.get('/api/attacks/history').then(res => setHistory(res.data)); } }, [isOpen]);
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Attack History</h3>
                    <button onClick={onClose} className="text-2xl">&times;</button>
                </div>
                <div className="overflow-y-auto max-h-[70vh]">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-100"><tr><th>Time</th><th>IP</th><th>Type</th><th>Location</th><th>Confidence</th></tr></thead>
                        <tbody>
                            {history.map(att => (
                                <tr key={att.id}>
                                    <td>{new Date(att.timestamp).toLocaleString()}</td>
                                    <td>{att.source_ip}</td><td>{att.attack_type}</td>
                                    <td>{att.city || 'N/A'}, {att.country}</td><td>{(att.confidence*100).toFixed(1)}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}