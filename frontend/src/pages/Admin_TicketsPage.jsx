// frontend/src/pages/Admin_TicketsPage.jsx

import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import TicketDetailsModal from '../components/TicketDetailsModal';

export default function AdminTicketsPage() {
    const [tickets, setTickets] = useState([]);
    const [selectedTicketId, setSelectedTicketId] = useState(null);

    const fetchTickets = () => {
        apiClient.get('/api/admin/tickets').then(res => setTickets(res.data));
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    return (
        <div>
            {selectedTicketId && <TicketDetailsModal ticketId={selectedTicketId} closeModal={() => setSelectedTicketId(null)} onUpdate={fetchTickets} />}
            
            <h1 className="text-3xl font-bold">Support Tickets</h1>
            <div className="bg-white p-4 mt-6 rounded-lg shadow-md">
                <table className="min-w-full">
                    <thead>
                        <tr><th>Subject</th><th>User</th><th>Priority</th><th>Status</th><th>Last Updated</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        {tickets.map(ticket => (
                            <tr key={ticket.id}>
                                <td>{ticket.subject}</td>
                                <td>{ticket.user.username}</td>
                                <td>{ticket.priority}</td>
                                <td>{ticket.status}</td>
                                <td>{new Date(ticket.updated_at).toLocaleString()}</td>
                                <td>
                                    <button onClick={() => setSelectedTicketId(ticket.id)} className="font-semibold text-blue-600">
                                        View / Reply
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}