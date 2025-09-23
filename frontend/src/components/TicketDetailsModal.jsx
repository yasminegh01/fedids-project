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

    if (isLoading) return <div>Loading ticket...</div>;
    if (!ticket) return <div>Ticket not found.</div>;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl">
                <h2 className="text-xl font-bold mb-4">{ticket.subject}</h2>
                
                <div className="space-y-4 h-80 overflow-y-auto p-4 border rounded">
                    {ticket.messages.map(msg => (
                        <div key={msg.id} className={`p-3 rounded-lg ${msg.author_id === user.id ? 'bg-blue-100 ml-auto' : 'bg-gray-100'}`} style={{maxWidth: '80%'}}>
                            <p className="font-semibold text-sm">{msg.author.username}</p>
                            <p>{msg.message}</p>
                            <p className="text-xs text-gray-500 text-right">{new Date(msg.created_at).toLocaleString()}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-4">
                    <textarea value={newMessage} onChange={e => setNewMessage(e.target.value)} rows="3" className="w-full p-2 border rounded" placeholder="Type your reply..."/>
                    <div className="flex justify-end gap-4 mt-2">
                        <button onClick={closeModal} className="bg-gray-200 px-4 py-2 rounded">Close</button>
                        <button onClick={handleReply} className="bg-blue-600 text-white px-4 py-2 rounded">Send Reply</button>
                    </div>
                </div>
            </div>
        </div>
    );
}