import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { useAuth } from '../context/AuthContext';

export default function TicketDetailsModal({ ticketId, closeModal, onUpdate }) {
    const { user } = useAuth();
    const [ticket, setTicket] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (ticketId) {
            setIsLoading(true);
            apiClient.get(`/api/tickets/${ticketId}`)
                .then(res => setTicket(res.data))
                .finally(() => setIsLoading(false));
        }
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

    if (!ticketId) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-bg-primary p-6 rounded-lg shadow-xl w-full max-w-2xl flex flex-col">
                {isLoading ? (
                    <div className="text-center p-8 text-text-secondary">Loading ticket...</div>
                ) : !ticket ? (
                    <div className="text-center p-8">
                        <p className="text-text-primary">Ticket not found or could not be loaded.</p>
                        <button onClick={closeModal} className="mt-4 bg-bg-secondary px-4 py-2 rounded text-text-primary">Close</button>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-text-primary">{ticket.subject}</h2>
                            <button onClick={closeModal} className="text-text-secondary hover:text-red-500 text-2xl font-bold">&times;</button>
                        </div>
                        
                        <div className="flex-grow space-y-4 h-80 overflow-y-auto p-4 border border-gray-200 dark:border-gray-700 rounded bg-bg-secondary">
                            {ticket.messages?.map(msg => (
                                <div key={msg.id} className={`p-3 rounded-lg flex flex-col ${
                                    msg.author_id === user.id 
                                        ? 'bg-accent text-white self-end' 
                                        : 'bg-bg-primary text-text-primary self-start'
                                }`} style={{maxWidth: '80%'}}>
                                    <p className={`font-semibold text-sm ${msg.author_id === user.id ? 'text-blue-200' : 'text-text-secondary'}`}>
                                        {msg.author?.username || 'Unknown'}
                                    </p>
                                    <p>{msg.message}</p>
                                    <p className={`text-xs mt-1 text-right ${msg.author_id === user.id ? 'text-blue-200' : 'text-text-secondary'}`}>
                                        {new Date(msg.created_at).toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4">
                            {ticket.status !== 'closed' && (
                                <textarea 
                                    value={newMessage} 
                                    onChange={e => setNewMessage(e.target.value)} 
                                    rows="3" 
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-bg-primary rounded text-text-primary" 
                                    placeholder="Type your reply..."
                                />
                            )}
                            
                            <div className="flex justify-end gap-4 mt-2">
                                <button onClick={closeModal} className="bg-bg-secondary px-4 py-2 rounded font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 text-text-primary">Cancel</button>
                                
                                {user.role === 'admin' && ticket.status !== 'closed' && (
                                    <button onClick={handleCloseTicket} className="bg-green-500 text-white px-4 py-2 rounded font-semibold hover:bg-green-600">
                                        Mark as Closed
                                    </button>
                                )}
                                
                                {ticket.status !== 'closed' && (
                                    <button onClick={handleReply} className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded font-semibold">
                                        Send Reply
                                    </button>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}