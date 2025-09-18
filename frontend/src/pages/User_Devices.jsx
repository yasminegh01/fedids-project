// frontend/src/pages/User_Devices.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';

// --- Sous-composants ---

const CopyIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> );
const TrashIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg> );

const StatusIndicator = ({ status }) => {
    const isOnline = status === 'online';
    return (
        <div className="flex items-center gap-2">
            <span className={`relative flex h-3 w-3`}><span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'} opacity-75`}></span><span className={`relative inline-flex rounded-full h-3 w-3 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span></span>
            <span className={`text-sm font-semibold capitalize ${isOnline ? 'text-green-800' : 'text-red-700'}`}>{status || 'Offline'}</span>
        </div>
    );
};

const PreventionPanel = ({ device }) => {
    const { user } = useAuth();
    const [isEnabled, setIsEnabled] = useState(device.prevention_enabled);
    const [isLoading, setIsLoading] = useState(false);
    const handleToggle = async () => {
        if (user.role !== 'premium') { alert("This is a premium feature."); return; }
        setIsLoading(true); const newStatus = !isEnabled;
        try {
            await apiClient.post(`/api/devices/${device.id}/toggle-prevention`, { enabled: newStatus });
            setIsEnabled(newStatus);
        } catch (error) { console.error("Failed to update prevention status", error); } 
        finally { setIsLoading(false); }
    };
    const isOffline = device.status_info?.status !== 'online';
    const isPremium = user.role === 'premium';

    return (
        <div className={`mt-4 p-4 rounded-lg transition ${!isPremium ? 'bg-gray-100 opacity-60 cursor-not-allowed' : (isOffline ? 'bg-gray-100' : 'bg-green-50')}`}>
            <div className="flex justify-between items-center">
                <div>
                    <h4 className="font-bold text-gray-800">Intelligent Prevention</h4>
                    <p className="text-xs text-gray-600">{!isPremium ? 'Upgrade to Premium to enable' : (isOffline ? 'Device is offline' : 'Active threat blocking')}</p>
                </div>
                <label className="inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={isEnabled} onChange={handleToggle} disabled={isLoading || isOffline || !isPremium} className="sr-only peer"/>
                    <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:bg-gray-200"></div>
                </label>
            </div>
        </div>
    );
};

// --- COMPOSANT PRINCIPAL DE LA PAGE ---
export default function UserDevices() {
    const [devices, setDevices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [newDeviceName, setNewDeviceName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [generatedRegToken, setGeneratedRegToken] = useState(null);
    
    const SERVER_IP = "192.168.1.12"; // <<< METTEZ VOTRE IP ICI

    const fetchDevices = useCallback(async () => {
        try {
            const response = await apiClient.get('/api/devices/my-devices-with-status');
            setDevices(response.data);
        } catch (err) { setError('Could not fetch devices.'); } 
        finally { setIsLoading(false); }
    }, []);

    useEffect(() => {
        fetchDevices();
        const intervalId = setInterval(fetchDevices, 15000);
        return () => clearInterval(intervalId);
    }, [fetchDevices]);

    const handleRegisterDevice = async (e) => {
        e.preventDefault();
        setIsSubmitting(true); setError(''); setGeneratedRegToken(null);
        try {
            const response = await apiClient.post('/api/devices/register', { name: newDeviceName });
            setGeneratedRegToken(response.data.registration_token);
            setNewDeviceName('');
            await fetchDevices();
        } catch (err) { setError('Device registration failed.'); } 
        finally { setIsSubmitting(false); }
    };
    
    const handleDeleteDevice = async (deviceId) => {
        if (window.confirm("Are you sure you want to delete this device? This action cannot be undone.")) {
            try {
                await apiClient.delete(`/api/devices/${deviceId}`);
                fetchDevices(); 
            } catch (error) { alert("Failed to delete the device."); }
        }
    };
    
    const installCommand = `bash <(curl -s http://${SERVER_IP}:8000/api/devices/install/${generatedRegToken})`;
    const copyToClipboard = (text) => { navigator.clipboard.writeText(text).then(() => alert("Command copied!")); };

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800">Manage Your Devices & API Keys</h2>
            
            {generatedRegToken && (
                <div className="p-4 bg-blue-100 border-l-4 border-blue-500 rounded-r-lg shadow-lg">
                    <h4 className="font-bold text-blue-800">Device Registration Initiated!</h4>
                    <p className="text-sm my-2 text-blue-700">Run the following command on your new IIoT device's terminal:</p>
                    <div className="flex items-center justify-between gap-4 bg-gray-800 text-white p-3 rounded-md">
                        <pre className="font-mono text-sm overflow-x-auto">{installCommand}</pre>
                        <button onClick={() => copyToClipboard(installCommand)} className="p-2 rounded hover:bg-gray-600"><CopyIcon /></button>
                    </div>
                    <button onClick={() => setGeneratedRegToken(null)} className="mt-3 text-xs font-semibold text-gray-600 hover:underline">Dismiss</button>
                </div>
            )}
            
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4 text-gray-700">Register a New IIoT Device</h3>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                <form onSubmit={handleRegisterDevice} className="flex flex-col sm:flex-row gap-3">
                    <input type="text" value={newDeviceName} onChange={(e) => setNewDeviceName(e.target.value)}
                           placeholder="e.g., Factory Floor Sensor #3"
                           className="flex-grow border rounded-md p-2 w-full shadow-sm" required />
                    <button type="submit" className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-md hover:bg-blue-700" disabled={isSubmitting}>
                        {isSubmitting ? "Registering..." : "Register Device"}
                    </button>
                </form>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4 text-gray-700">Your Registered Devices</h3>
                {isLoading && <p>Loading your devices...</p>}
                {!isLoading && devices.length === 0 && <p className="text-gray-500 py-4">You have not registered any devices yet.</p>}
                
                {devices.length > 0 && (
                    <div className="space-y-6">
                        {devices.map(device => (
                            <div key={device.id} className="p-4 border rounded-lg shadow-sm">
                                <div className="flex justify-between items-start">
                                    <div className="flex-grow">
                                        <p className="font-bold text-lg text-gray-800">{device.name}</p>
                                        <p className="text-xs text-gray-500 font-mono mt-1">API Key: <code>{device.api_key.substring(0, 8)}...</code></p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <StatusIndicator status={device.status_info?.status || 'offline'} />
                                        <button onClick={() => handleDeleteDevice(device.id)} className="text-gray-400 hover:text-red-600 p-1" title="Delete Device">
                                            <TrashIcon />
                                        </button>
                                    </div>
                                </div>
                                <PreventionPanel device={device} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}