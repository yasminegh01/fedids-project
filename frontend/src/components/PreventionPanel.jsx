// frontend/src/components/PreventionPanel.jsx

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';

// Composant spécifique pour le toggle, pour plus de clarté
export default function PreventionPanel({ device }) {
    const { user } = useAuth();
    // L'état initial du toggle est basé sur la valeur reçue de l'API pour CET appareil
    const [isEnabled, setIsEnabled] = useState(device.prevention_enabled);
    const [isLoading, setIsLoading] = useState(false);
    
    const handleToggle = async () => {
        if (user.role !== 'premium') {
            alert("Intelligent Prevention is a premium feature. Please upgrade your plan.");
            return;
        }
        
        setIsLoading(true);
        const newStatus = !isEnabled;
        
        try {
            // Appeler l'API pour mettre à jour l'état sur le serveur
            await apiClient.post(`/api/devices/${device.id}/toggle-prevention`, { enabled: newStatus });
            setIsEnabled(newStatus); // Mettre à jour l'UI uniquement si l'API a réussi
        } catch (error) {
            console.error("Failed to update prevention status", error);
            alert("Failed to update status. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    // Griser le toggle si l'appareil est offline
    const isOffline = device.status_info?.status !== 'online';

    return (
        <div className={`p-4 rounded-lg ${isOffline ? 'bg-gray-100' : 'bg-green-50'}`}>
            <div className="flex justify-between items-center">
                <div>
                    <h4 className="font-bold text-gray-800">Intelligent Prevention</h4>
                    <p className={`text-xs ${isOffline ? 'text-gray-400' : 'text-gray-600'}`}>
                        {isOffline ? 'Device is offline. Cannot change status.' : 'Actively blocks high-confidence threats.'}
                    </p>
                </div>
                
                <label className="inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={isEnabled} 
                        onChange={handleToggle}
                        // Le toggle est désactivé si l'appareil est offline, si ce n'est pas premium, ou pendant une mise à jour
                        disabled={isLoading || user.role !== 'premium' || isOffline}
                        className="sr-only peer"
                    />
                    <div className="relative w-11 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 peer-disabled:bg-gray-200"></div>
                </label>
            </div>
        </div>
    );
}