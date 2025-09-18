// frontend/src/pages/User_RegisterDevice.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';

// apiClient pour faire des requêtes authentifiées
const apiClient = axios.create({
    baseURL: 'http://127.0.0.1:8000',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
});

// Icône pour copier
const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);


export default function UserRegisterDevice() {
    const [devices, setDevices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const [newDeviceName, setNewDeviceName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Pour afficher la clé après la création
    const [generatedApiKey, setGeneratedApiKey] = useState(null);

    // Fonction pour récupérer les appareils
    const fetchDevices = async () => {
        setIsLoading(true);
        try {
            const response = await apiClient.get('/api/devices/my-devices');
            setDevices(response.data);
        } catch (error) {
            setError('Could not fetch devices.');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDevices();
    }, []);

    const handleRegisterDevice = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        setGeneratedApiKey(null);
        try {
            const response = await apiClient.post('/api/devices/register', { name: newDeviceName });
            setGeneratedApiKey(response.data.api_key); // On stocke la nouvelle clé pour l'afficher
            setNewDeviceName(''); // On vide le formulaire
            fetchDevices(); // On rafraîchit la liste des appareils
        } catch (err) {
            setError('Device registration failed.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert("API Key copied to clipboard!");
    };


    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Manage Devices & API Keys</h2>
            
            {/* Boîte de notification pour la nouvelle clé API */}
            {generatedApiKey && (
                <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 mb-8 rounded-r-lg">
                    <h4 className="font-bold text-yellow-800">Device Registered Successfully!</h4>
                    <p className="text-sm mt-1 mb-2 text-yellow-700">Please copy this API Key and save it in the <strong>`config.ini`</strong> file on your device. <strong>This key will not be shown again.</strong></p>
                    <div className="flex items-center gap-4 bg-gray-800 text-white p-2 rounded">
                        <pre className="font-mono text-sm overflow-x-auto">{generatedApiKey}</pre>
                        <button 
                            onClick={() => copyToClipboard(generatedApiKey)}
                            className="bg-gray-600 hover:bg-gray-500 p-2 rounded"
                            title="Copy to Clipboard"
                        >
                            <CopyIcon />
                        </button>
                    </div>
                    <button onClick={() => setGeneratedApiKey(null)} className="mt-3 text-xs font-semibold text-gray-600 hover:underline">Dismiss</button>
                </div>
            )}
            
            {/* Formulaire pour ajouter un nouvel appareil */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-700">Register a New Device</h3>
                <form onSubmit={handleRegisterDevice} className="flex flex-col sm:flex-row gap-4">
                    <input 
                        type="text"
                        value={newDeviceName}
                        onChange={(e) => setNewDeviceName(e.target.value)}
                        placeholder="e.g., Raspberry Pi - Living Room"
                        className="flex-grow border rounded-md p-2 w-full"
                        required 
                    />
                    <button 
                        type="submit" 
                        className="bg-green-600 text-white font-semibold px-6 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Registering..." : "Register"}
                    </button>
                </form>
            </div>
            
            {/* Liste des appareils existants */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4 text-gray-700">Your Registered Devices</h3>
                {isLoading && <p>Loading your devices...</p>}
                {error && <p className="text-red-500">{error}</p>}
                {!isLoading && !error && (
                    <div className="divide-y divide-gray-200">
                        {devices.length > 0 ? devices.map(device => (
                            <div key={device.id} className="py-4">
                                <p className="font-bold text-lg text-gray-800">{device.name}</p>
                                <p className="text-xs text-gray-500 font-mono mt-1">
                                    API Key: <code>{device.api_key.substring(0, 8)}...</code>
                                </p>
                            </div>
                        )) : (
                           <p className="text-gray-500">You have not registered any devices yet.</p> 
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}