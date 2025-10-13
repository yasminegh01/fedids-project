// frontend/src/components/PreventionLog.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

export default function PreventionLog({ deviceId }) {
    const [logs, setLogs] = useState([]);
    useEffect(() => {
        if (deviceId) {
            apiClient.get(`/api/devices/${deviceId}/prevention-logs`)
                .then(res => setLogs(res.data));
        }
    }, [deviceId]);

    return (
        <div className="mt-4 border-t pt-4">
            <h5 className="font-semibold text-sm text-text-secondary mb-2">Latest Prevention Actions:</h5>
            {logs.length > 0 ? (
                <div className="space-y-2 text-xs">
                    {logs.map(log => (
                        <div key={log.timestamp} className="p-2 bg-green-50 dark:bg-green-900/20 rounded">
                            <p className="font-mono text-green-800 dark:text-green-300">{log.action_taken}</p>
                            <p className="text-gray-500">{new Date(log.timestamp).toLocaleString()}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-xs text-gray-500">No prevention actions recorded yet.</p>
            )}
        </div>
    );
}