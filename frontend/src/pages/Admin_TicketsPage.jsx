// frontend/src/pages/Admin_TicketsPage.jsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import apiClient from '../api/apiClient';
import TicketDetailsModal from '../components/TicketDetailsModal';

// --- Sous-composants pour les Badges ---

const StatusBadge = ({ status }) => {
    const styles = {
        open: 'bg-blue-100 text-blue-800',
        in_progress: 'bg-purple-100 text-purple-800',
        pending_user: 'bg-yellow-100 text-yellow-800',
        pending_admin: 'bg-orange-100 text-orange-800',
        closed: 'bg-gray-200 text-gray-800',
    };
    return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status] || 'bg-gray-100'}`}>
            {status.replace('_', ' ')}
        </span>
    );
};

const PriorityBadge = ({ priority }) => {
    const styles = {
        low: 'bg-gray-100 text-gray-800',
        medium: 'bg-green-100 text-green-800',
        high: 'bg-yellow-100 text-yellow-800',
        critical: 'bg-red-100 text-red-800 animate-pulse',
    };
    return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[priority] || 'bg-gray-100'}`}>
            {priority}
        </span>
    );
};

// --- Composant Principal de la Page ---

export default function AdminTicketsPage() {
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    
    // États pour les filtres
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');

    const fetchTickets = useCallback(() => {
        setIsLoading(true);
        apiClient.get('/api/admin/tickets')
            .then(res => setTickets(res.data))
            .catch(err => setError("Failed to load tickets."))
            .finally(() => setIsLoading(false));
    }, []);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    const handleAssign = async (ticketId) => {
        try {
            await apiClient.post(`/api/admin/tickets/${ticketId}/assign`);
            fetchTickets(); // Rafraîchir pour voir le nouveau statut et l'admin assigné
        } catch (error) {
            alert("Failed to assign ticket.");
        }
    };

    // Filtrer les tickets en fonction des états des filtres
    const filteredTickets = useMemo(() => {
        return tickets.filter(t => {
            const statusMatch = statusFilter === 'all' || t.status === statusFilter;
            const priorityMatch = priorityFilter === 'all' || t.priority === priorityFilter;
            return statusMatch && priorityMatch;
        });
    }, [tickets, statusFilter, priorityFilter]);

    return (
        <div>
            {selectedTicketId && 
                <TicketDetailsModal 
                    ticketId={selectedTicketId} 
                    closeModal={() => setSelectedTicketId(null)} 
                    onUpdate={fetchTickets} 
                />
            }
            
            <h1 className="text-3xl font-bold text-gray-800">Support Tickets</h1>
            <p className="text-gray-600 mt-1">Manage and respond to all user inquiries.</p>
            
            {/* Panneau de Filtres */}
            <div className="bg-white p-4 mt-6 rounded-lg shadow-md flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <label className="font-semibold text-sm">Status:</label>
                    <select onChange={e => setStatusFilter(e.target.value)} value={statusFilter} className="p-1 border rounded-md text-sm">
                        <option value="all">All</option>
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="pending_user">Pending User</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <label className="font-semibold text-sm">Priority:</label>
                    <select onChange={e => setPriorityFilter(e.target.value)} value={priorityFilter} className="p-1 border rounded-md text-sm">
                        <option value="all">All</option>
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                </div>
            </div>

            <div className="bg-white p-4 mt-6 rounded-lg shadow-md overflow-x-auto">
                {isLoading && <p className="text-center p-4">Loading tickets...</p>}
                {error && <p className="text-center p-4 text-red-600">{error}</p>}
                
                {!isLoading && !error && (
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr className="text-left">
                                <th className="p-3 font-semibold">Subject</th>
                                <th className="p-3 font-semibold">User</th>
                                <th className="p-3 font-semibold">Priority</th>
                                <th className="p-3 font-semibold">Status</th>
                                <th className="p-3 font-semibold">Assigned To</th>
                                <th className="p-3 font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredTickets.map(ticket => (
                                <tr key={ticket.id} className="hover:bg-gray-50">
                                    <td className="p-3 font-semibold">{ticket.subject}</td>
                                    <td className="p-3">{ticket.user?.username || 'N/A'}</td>
                                    <td className="p-3"><PriorityBadge priority={ticket.priority} /></td>
                                    <td className="p-3"><StatusBadge status={ticket.status} /></td>
                                    <td className="p-3">
                                        {ticket.assigned_admin ? (
                                            <span className="font-semibold">{ticket.assigned_admin.username}</span>
                                        ) : (
                                            <button onClick={() => handleAssign(ticket.id)} className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300">
                                                Assign to Me
                                            </button>
                                        )}
                                    </td>
                                    <td className="p-3">
                                        <button onClick={() => setSelectedTicketId(ticket.id)} className="font-semibold text-blue-600 hover:underline">
                                            View / Reply
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );}