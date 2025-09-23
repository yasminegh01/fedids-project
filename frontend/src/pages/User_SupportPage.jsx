// frontend/src/pages/User_SupportPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/apiClient';
import TicketDetailsModal from '../components/TicketDetailsModal'; // On va créer ce composant

// Composant pour créer un nouveau ticket
function NewTicketForm({ onTicketCreated }) {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await apiClient.post('/api/tickets', { subject, message });
            setSubject('');
            setMessage('');
            onTicketCreated(); // Notifier le parent de rafraîchir la liste
        } catch (error) {
            alert("Failed to create ticket.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="font-semibold">Subject</label>
                <input type="text" value={subject} onChange={e => setSubject(e.target.value)} required className="w-full p-2 border rounded mt-1" />
            </div>
            <div>
                <label className="font-semibold">Message</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)} required rows="5" className="w-full p-2 border rounded mt-1" />
            </div>
            <button type="submit" disabled={isLoading} className="bg-blue-600 text-white px-5 py-2 rounded">
                {isLoading ? 'Submitting...' : 'Submit Ticket'}
            </button>
        </form>
    );
}

// Composant principal de la page
export default function UserSupportPage() {
    const [tickets, setTickets] = useState([]);
    const [selectedTicketId, setSelectedTicketId] = useState(null);

    const fetchTickets = useCallback(() => {
        apiClient.get('/api/tickets/my-tickets').then(res => setTickets(res.data));
    }, []);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {selectedTicketId && <TicketDetailsModal ticketId={selectedTicketId} closeModal={() => setSelectedTicketId(null)} onUpdate={fetchTickets} />}
            
            <div className="md:col-span-1">
                <h2 className="text-2xl font-bold mb-4">Submit a New Ticket</h2>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <NewTicketForm onTicketCreated={fetchTickets} />
                </div>
            </div>

            <div className="md:col-span-2">
                <h2 className="text-2xl font-bold mb-4">Your Tickets</h2>
                <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
                    {tickets.length > 0 ? tickets.map(ticket => (
                        <div key={ticket.id} className="p-4 border rounded hover:bg-gray-50">
                            <div className="flex justify-between">
                                <p className="font-semibold">{ticket.subject}</p>
                                <span className={`px-2 py-1 text-xs rounded-full ${ticket.status === 'closed' ? 'bg-gray-200' : 'bg-green-100 text-green-800'}`}>
                                    {ticket.status}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500">Category: {ticket.category} | Priority: {ticket.priority}</p>
                            <button onClick={() => setSelectedTicketId(ticket.id)} className="text-blue-600 text-sm mt-2">View Details</button>
                        </div>
                    )) : <p>You have no support tickets.</p>}
                </div>
            </div>
        </div>
    );
}