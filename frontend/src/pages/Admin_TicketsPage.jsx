import React, { useState, useEffect, useCallback, useMemo } from 'react';
import apiClient from '../api/apiClient';
import TicketDetailsModal from '../components/TicketDetailsModal';
import { Pie } from 'react-chartjs-2'; 

// 👉 Import from chart.js
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// 👉 Register chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

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
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
 const [stats, setStats] = useState(null); // <<< NOUVEL ÉTAT POUR LES STATS
   const fetchTickets = useCallback(() => {
    setIsLoading(true);
    apiClient.get('/api/admin/tickets')
        .then(res => setTickets(res.data))
        .catch(err => setError("Failed to load tickets."))
        .finally(() => setIsLoading(false));
}, []);
const fetchStats = useCallback(() => {
    apiClient.get('/api/admin/tickets/stats')
        .then(res => {
            const data = res.data;
            setStats({
                labels: data.map(d => d.category.replace('_', ' ').toUpperCase()),
                datasets: [{
                    data: data.map(d => d.count),
                    // === LA NOUVELLE PALETTE PASTEL EST ICI ===
                    backgroundColor: [
    'rgba(180,108,74, 0.7)',   // Warm earthy brown
    'rgba(90,89,157, 0.7)',    // Deep muted purple
    'rgba(159,146,119, 0.7)',  // Soft sandy beige (fixed missing comma)
    'rgba(120,74,62, 0.7)',    // Warm brick brown
    'rgba(253,186,140, 0.7)',  // Light peach
    'rgba(100,47,27, 0.7)',    // Deep chocolate brown
    'rgba(75,129,142, 0.7)',   // Teal blue (new)
    'rgba(201,144,193, 0.7)',  // Soft mauve (new)
],
borderColor: [
    'rgba(180,108,74, 1)',
    'rgba(90,89,157, 1)',
    'rgba(159,146,119, 1)',    
    'rgba(120,74,62, 1)',
    'rgba(253,186,140, 1)',
    'rgba(100,47,27, 1)',
    'rgba(75,129,142, 1)',     
    'rgba(201,144,193, 1)',    
],
                    borderWidth: 1,
                }]
            });
        });
}, []);
    useEffect(() => { 
        fetchTickets();
        fetchStats();
    }, [fetchTickets, fetchStats]);
    const handleDelete = async (ticketId) => {
        try {
            await apiClient.delete(`/api/tickets/${ticketId}`);
            fetchTickets(); // Rafraîchir la liste
        } catch (error) {
            // Afficher le message d'erreur spécifique renvoyé par le backend
            alert(error.response?.data?.detail || "Failed to delete ticket.");
        }
    };

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
    <div className="space-y-6">
      {selectedTicketId && (
        <TicketDetailsModal
          ticketId={selectedTicketId}
          closeModal={() => setSelectedTicketId(null)}
          onUpdate={fetchTickets}
        />
      )}

      <h1 className="text-3xl font-bold text-text-primary">Support Tickets</h1>
      <p className="text-text-secondary mt-1">Manage and respond to all user inquiries.</p>

      {/* Filtres */}
      <div className="bg-bg-primary p-4 mt-6 rounded-lg shadow-md flex items-center gap-6">
        <div className="flex items-center gap-2">
          <label className="font-semibold text-sm text-text-secondary">Status:</label>
          <select
            onChange={e => setStatusFilter(e.target.value)}
            value={statusFilter}
            className="p-1 border border-gray-300 dark:border-gray-600 bg-bg-primary rounded-md text-sm text-text-primary"
          >
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="pending_user">Pending User</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="font-semibold text-sm text-text-secondary">Priority:</label>
          <select
            onChange={e => setPriorityFilter(e.target.value)}
            value={priorityFilter}
            className="p-1 border border-gray-300 dark:border-gray-600 bg-bg-primary rounded-md text-sm text-text-primary"
          >
            <option value="all">All</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-bg-primary p-4 mt-6 rounded-lg shadow-md overflow-x-auto">
        {isLoading && <p className="text-center p-4 text-text-secondary">Loading tickets...</p>}
        {error && <p className="text-center p-4 text-red-500">{error}</p>}

        {!isLoading && !error && (
          <table className="min-w-full text-sm">
            <thead className="bg-bg-secondary">
              <tr className="text-left">
                <th className="p-3 font-semibold text-text-secondary">Subject</th>
                <th className="p-3 font-semibold text-text-secondary">User</th>
                <th className="p-3 font-semibold text-text-secondary">Priority</th>
                <th className="p-3 font-semibold text-text-secondary">Status</th>
                <th className="p-3 font-semibold text-text-secondary">Assigned To</th>
                <th className="p-3 font-semibold text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTickets.map(ticket => (
                <tr key={ticket.id} className="hover:bg-bg-secondary">
                  <td className="p-3 font-semibold text-text-primary">{ticket.subject}</td>
                  <td className="p-3 text-text-secondary">{ticket.user?.username || 'N/A'}</td>
                  <td className="p-3"><PriorityBadge priority={ticket.priority} /></td>
                  <td className="p-3"><StatusBadge status={ticket.status} /></td>
                  <td className="p-3">
                    {ticket.assigned_admin ? (
                      <span className="font-semibold text-text-primary">{ticket.assigned_admin.username}</span>
                    ) : (
                      <button
                        onClick={() => handleAssign(ticket.id)}
                        className="text-xs bg-bg-secondary text-text-secondary px-2 py-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                      >
                        Assign to Me
                      </button>
                    )}
                  </td>
                  <td className="p-3 space-x-4">
                    <button
                      onClick={() => setSelectedTicketId(ticket.id)}
                      className="font-semibold text-accent hover:underline"
                    >
                      View / Reply
                    </button>
                    {ticket.status === 'closed' && (
                      <button
                        onClick={() => handleDelete(ticket.id)}
                        className="font-semibold text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Statistiques */}
      <div className="bg-bg-primary p-6 mt-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-text-primary mb-4">Ticket Statistics by Category</h2>
        <div className="max-w-md mx-auto">
          {stats ? <Pie data={stats} /> : <p>Loading stats...</p>}
        </div>
      </div>
    </div>
  );
}