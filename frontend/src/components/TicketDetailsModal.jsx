// frontend/src/components/TicketDetailsModal.jsx

import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { useAuth } from '../context/AuthContext';

export default function TicketDetailsModal({ ticketId, closeModal, onUpdate }) {
    const { user } = useAuth();
    const [ticket, setTicket] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
        apiClient.get(`/api/tickets/${ticketId}`)
            .then(res => setTicket(res.data))
            .finally(() => setIsLoading(false));
    }, [ticketId]);

const handleCloseTicket = async () => {
    if (window.confirm("Are you sure you want to close this ticket? You won't be able to reply further.")) {
        try {
            await apiClient.post(`/api/tickets/${ticketId}/close`);
            onUpdate(); // Rafraîchir la liste des tickets dans la page parente
            closeModal(); // Fermer la modale
        } catch (error) {
            alert("Failed to close the ticket.");
        }
    }
};
    const handleReply = async () => {
        if (!newMessage.trim()) return;
        try {
            await apiClient.post(`/api/tickets/${ticketId}/reply`, { message: newMessage });
            setNewMessage('');
            // Recharger les détails du ticket pour voir la nouvelle réponse
            const res = await apiClient.get(`/api/tickets/${ticketId}`);
            setTicket(res.data);
            onUpdate(); // Notifier la page parente de se rafraîchir
        } catch (error) {
            alert("Failed to send reply.");
        }
    };
 // 1. Gérer l'état de chargement
    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-xl">Loading ticket...</div>
            </div>
        );
    }

    // 2. Gérer l'état d'erreur (si le ticket n'a pas pu être chargé)
    if (!ticket) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-xl">
                    <p>Ticket not found or could not be loaded.</p>
                    <button onClick={closeModal} className="mt-4 bg-gray-200 px-4 py-2 rounded">Close</button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">{ticket.subject}</h2>
                    <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                </div>
                
                {/* Affichage de la conversation */}
                <div className="flex-grow space-y-4 h-80 overflow-y-auto p-4 border rounded bg-gray-50">
                    {ticket.messages?.map(msg => (
                        <div key={msg.id} className={`p-3 rounded-lg flex flex-col ${msg.author_id === user.id ? 'bg-blue-100 self-end' : 'bg-gray-200 self-start'}`} style={{maxWidth: '80%'}}>
                            <p className="font-semibold text-sm text-gray-700">{msg.author?.username || 'Unknown'}</p>
                            <p>{msg.message}</p>
                            <p className="text-xs text-gray-500 text-right mt-1">{new Date(msg.created_at).toLocaleString()}</p>
                        </div>
                    ))}
                </div>

                {/* === LE BLOC D'ACTIONS FINAL ET CORRIGÉ === */}
                <div className="mt-4">
                    {/* Le champ de réponse ne s'affiche que si le ticket n'est pas fermé */}
                    {ticket.status !== 'closed' && (
                        <textarea 
                            value={newMessage} 
                            onChange={e => setNewMessage(e.target.value)} 
                            rows="3" 
                            className="w-full p-2 border rounded" 
                            placeholder="Type your reply..."
                        />
                    )}
                    
                    <div className="flex justify-end gap-4 mt-2">
                        <button onClick={closeModal} className="bg-gray-200 px-4 py-2 rounded font-semibold hover:bg-gray-300">Cancel</button>
                        
                        {/* Le bouton "Mark as Closed" n'est visible que par l'ADMIN et si le ticket n'est pas déjà fermé */}
                        {user.role === 'admin' && ticket.status !== 'closed' && (
                            <button 
                                onClick={handleCloseTicket} 
                                className="bg-green-500 text-white px-4 py-2 rounded font-semibold hover:bg-green-600"
                            >
                                Mark as Closed
                            </button>
                        )}
                        
                        {/* Le bouton "Send Reply" est visible par tout le monde, sauf si le ticket est fermé */}
                        {ticket.status !== 'closed' && (
                            <button 
                                onClick={handleReply} 
                                className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700"
                            >
                                Send Reply
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );}