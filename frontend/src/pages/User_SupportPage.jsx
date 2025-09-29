import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/apiClient';
import TicketDetailsModal from '../components/TicketDetailsModal';

// --- Sous-composant : Formulaire de Création de Ticket ---
function NewTicketForm({ onTicketCreated }) {
    const [category, setCategory] = useState('general');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [suggestedArticles, setSuggestedArticles] = useState([]);

    useEffect(() => {
        const handler = setTimeout(() => {
            if (subject.length > 3) {
                apiClient.get(`/api/faq/search?query=${subject}`)
                    .then(res => setSuggestedArticles(res.data))
                    .catch(() => setSuggestedArticles([]));
            } else {
                setSuggestedArticles([]);
            }
        }, 500);
        return () => clearTimeout(handler);
    }, [subject]);

   const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await apiClient.post('/api/tickets', { category, subject, message });
            setCategory('general');
            setSubject('');
            setMessage('');
            setSuggestedArticles([]);
            onTicketCreated();
        } catch (error) {
            alert("Failed to create ticket.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="font-semibold text-sm text-text-secondary">Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-bg-primary rounded mt-1 text-text-primary">
                  <option value="general_inquiry">General Inquiry</option>
                    <option value="technical_issue">Technical Issue</option>
                    <option value="billing_question">Billing Question</option>
                    
                    {/* === AJOUTEZ SIMPLEMENT VOS NOUVELLES CATÉGORIES ICI === */}
                    <option value="feature_request">Feature Request</option>
                    <option value="account_issue">Account Issue</option>
                    <option value="other">Other</option>
                </select>
            </div>
            <div>
                <label className="font-semibold text-sm text-text-secondary">Subject</label>
                <input type="text" value={subject} onChange={e => setSubject(e.target.value)} required className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-bg-primary rounded mt-1 text-text-primary" />
            </div>

            {suggestedArticles.length > 0 && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-300 dark:border-blue-500">
                    <h4 className="font-bold text-sm text-blue-800 dark:text-blue-300">Do any of these help?</h4>
                    <div className="mt-2 space-y-2">
                        {suggestedArticles.map(article => (
                            <div key={article.id} className="text-sm">
                                <p className="font-semibold text-text-primary">{article.question}</p>
                                <p className="text-text-secondary">{article.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div>
                <label className="font-semibold text-sm text-text-secondary">Message</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)} required rows="5" className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-bg-primary rounded mt-1 text-text-primary" />
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-accent hover:bg-accent-hover text-white px-5 py-2 rounded font-semibold disabled:bg-gray-400">
                {isLoading ? 'Submitting...' : 'Submit Ticket'}
            </button>
        </form>
    );
}

// --- Composant Principal de la Page ---
export default function UserSupportPage() {
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTicketId, setSelectedTicketId] = useState(null);

const fetchTickets = useCallback(() => {
        setIsLoading(true);
        apiClient.get('/api/tickets/my-tickets')
            .then(res => setTickets(res.data))
            .finally(() => setIsLoading(false));
    }, []);
    useEffect(() => { fetchTickets(); }, [fetchTickets]);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-text-primary">Support Center</h1>
            
            {selectedTicketId && <TicketDetailsModal ticketId={selectedTicketId} closeModal={() => setSelectedTicketId(null)} onUpdate={fetchTickets} />}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <h2 className="text-2xl font-bold mb-4 text-text-primary">Submit a New Ticket</h2>
                    <div className="bg-bg-primary p-6 rounded-lg shadow-md">
                        <NewTicketForm onTicketCreated={fetchTickets} />
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <h2 className="text-2xl font-bold mb-4 text-text-primary">Your Tickets</h2>
                    <div className="bg-bg-primary p-6 rounded-lg shadow-md space-y-4">
                        {isLoading ? <p className="text-text-secondary">Loading your tickets...</p> :
                         tickets.length > 0 ? tickets.map(ticket => (
                            <div key={ticket.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg transition-shadow">
                                <div className="flex justify-between items-center">
                                    <p className="font-semibold text-text-primary">{ticket.subject}</p>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${ticket.status === 'closed' ? 'bg-gray-200 text-gray-800' : 'bg-green-100 text-green-800'}`}>
                                        {ticket.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <p className="text-sm text-text-secondary mt-1">Category: {ticket.category} | Priority: {ticket.priority}</p>
                                <button onClick={() => setSelectedTicketId(ticket.id)} className="text-accent text-sm font-semibold mt-2 hover:underline">
                                    View Details
                                </button>
                            </div>
                        )) : <p className="text-text-secondary">You have no support tickets.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}