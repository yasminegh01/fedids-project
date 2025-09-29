// frontend/src/components/AttackFeed.jsx

import React from 'react';
import { useTheme } from '../context/ThemeContext';
// Icône simple pour le chatbot
const ChatIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);


// Ce composant reçoit les données 'attacks' et 'status' via ses props. Il est "stupide".
export default function AttackFeed({ attacks, status, onAdviceClick }) {
        const { theme } = useTheme(); 

    const statusColors = {
        'dark': {
            'Connecting': 'text-yellow-400',
            'Connected': 'text-green-400',
            'Disconnected': 'text-red-400',
        },
        'light': {
            'Connecting': 'text-yellow-600',
            'Connected': 'text-green-600',
            'Disconnected': 'text-red-600',
        }
    };
    const statusColor = statusColors[theme][status] || 'text-gray-500';

    return (
        // Le conteneur principal utilise les couleurs du thème
        <div className="bg-bg-primary p-4 rounded-lg shadow-md h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-text-primary">Real-time Detection Feed</h3>
                <span className={`text-xs font-bold capitalize ${statusColor}`}>{status}</span>
            </div>
            
            <div className="flex-grow space-y-3 max-h-[30rem] overflow-y-auto pr-2">
                {/* Condition d'affichage pour le cas où il n'y a pas d'attaques */}
                {attacks.length === 0 ? (
                    <div className="text-center py-16 flex flex-col items-center justify-center h-full">
                        <p className="text-sm text-text-secondary">
                            {status === 'Connected' ? 'No recent attacks detected. System is secure.' : 'Awaiting connection to the event stream...'}
                        </p>
                    </div>
                ) : (
                    // Mapper les attaques si le tableau n'est pas vide
                    attacks.map((attack, index) => (
                        <div key={attack.id || index} className="p-3 bg-bg-secondary border-l-4 border-red-500 rounded-md">
                            <div className="flex justify-between items-start gap-4">
                                <div>
                                    <p className="font-bold text-red-500">{attack.attack_type}</p>
                                    <p className="text-sm text-text-secondary mt-1">
                                        Source: <span className="font-mono">{attack.source_ip}</span>
                                    </p>
                                    {attack.confidence != null &&
                                        <p className="text-xs text-red-600 mt-1">
                                            Confidence: <strong>{(attack.confidence * 100).toFixed(1)}%</strong>
                                        </p>
                                    }
                                </div>
                                <button
                                    onClick={() => onAdviceClick(`Tell me more about this ${attack.attack_type} attack from ${attack.source_ip}`)}
                                    className="flex items-center flex-shrink-0 gap-1.5 bg-bg-tertiary text-xs text-text-secondary font-semibold px-2 py-1 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                                >
                                    <ChatIcon />
                                    Get Advice
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}