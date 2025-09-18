// frontend/src/components/AttackFeed.jsx

import React from 'react';

// Icône simple pour le chatbot
const ChatIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);


// Ce composant reçoit les données 'attacks' et 'status' via ses props. Il est "stupide".
export default function AttackFeed({ attacks, status, onAdviceClick }) {
    
    const statusColor = {
        'connected': 'text-green-500',
        'connecting': 'text-yellow-500',
        'disconnected': 'text-red-500',
        'error': 'text-red-500',
        'unauthorized': 'text-red-700',
    }[status];

    return (
        <div className="bg-white p-6 rounded-lg shadow-md h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-700">Real-time Detection Feed</h3>
                <span className={`text-xs font-bold capitalize ${statusColor}`}>{status}</span>
            </div>
            
            <div className="flex-grow space-y-4 max-h-[30rem] overflow-y-auto pr-2">
                {attacks.length > 0 ? (
                    attacks.map((attack) => ( // Note: pas besoin d'index si attack.id est unique
                        <div key={attack.id || Math.random()} className="p-3 bg-red-50 border-l-4 border-red-500 rounded-md">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-red-800">{attack.attack_type}</p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Source: <span className="font-mono">{attack.source_ip}</span> at {new Date(attack.timestamp).toLocaleTimeString()}
                                    </p>
                                    {attack.confidence != null &&
                                        <p className="text-xs text-red-600">
                                            Confidence: <strong>{(attack.confidence * 100).toFixed(1)}%</strong>
                                        </p>
                                    }
                                </div>
                                <button
                                    onClick={() => onAdviceClick(`What are the immediate steps for a ${attack.attack_type} attack?`)}
                                    className="flex items-center gap-1.5 bg-gray-200 text-xs text-gray-700 font-semibold px-2 py-1 rounded-md hover:bg-gray-300"
                                >
                                    <ChatIcon />
                                    Get Advice
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-16">
                        <p className="text-sm text-gray-500">Monitoring for threats... No new events.</p>
                    </div>
                )}
            </div>
        </div>
    );
}