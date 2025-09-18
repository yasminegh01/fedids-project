// frontend/src/components/ClientManagement.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';

// --- Configuration de l'API Client ---
// Helper pour centraliser la configuration de l'API
const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  // On s'assure que chaque requête est authentifiée
  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
});

// --- Composants Modals ---

// Modal pour modifier un client
function EditClientModal({ client, closeModal, onSave }) {
    // États pour les champs du formulaire
    const [name, setName] = useState(client.name);
    const [status, setStatus] = useState(client.status);
    const [notes, setNotes] = useState(client.notes || '');

    const handleSave = async () => {
        try {
            await apiClient.put(`/api/admin/clients/${client.id}`, { name, status, notes });
            onSave(); // Rafraîchit la liste dans le composant parent
            closeModal(); // Ferme la modal
        } catch (error) {
            alert("Échec de la mise à jour: " + (error.response?.data?.detail || error.message));
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-xl font-bold mb-4">Modifier le client : {client.name}</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nom du client</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Statut</label>
                        <select value={status} onChange={e => setStatus(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white">
                            <option value="active">Actif</option>
                            <option value="disabled">Désactivé</option>
                            <option value="requires_review">En attente de révision</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Notes (Admin)</label>
                        <textarea rows="4" value={notes} onChange={e => setNotes(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={closeModal} className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 font-semibold">Annuler</button>
                    <button onClick={handleSave} className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 font-semibold">Enregistrer</button>
                </div>
            </div>
        </div>
    );
}

// Modal pour afficher l'historique
function HistoryModal({ client, closeModal }) {
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        apiClient.get(`/api/admin/clients/${client.id}/history`)
            .then(res => setHistory(res.data))
            .catch(err => console.error("Failed to fetch history:", err))
            .finally(() => setIsLoading(false));
    }, [client.id]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-3xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Historique de : {client.name}</h3>
                    <button onClick={closeModal} className="text-gray-500 hover:text-red-600 text-2xl font-bold">&times;</button>
                </div>
                <div className="overflow-y-auto h-96 border rounded-md">
                    {isLoading ? <p className="p-4 text-center">Chargement...</p> : (
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="p-2 font-semibold">Round</th>
                                    <th className="p-2 font-semibold">Précision</th>
                                    <th className="p-2 font-semibold">Perte (Loss)</th>
                                    <th className="p-2 font-semibold">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {history.map(h => (
                                    <tr key={h.server_round} className="text-center hover:bg-gray-50">
                                        <td className="p-2">{h.server_round}</td>
                                        <td className="p-2 font-semibold text-green-600">{`${(h.accuracy * 100).toFixed(2)}%`}</td>
                                        <td className="p-2 text-red-600">{h.loss.toFixed(4)}</td>
                                        <td className="p-2 text-gray-500">{new Date(h.timestamp).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

// --- Composant Principal de la Page ---

export default function ClientManagement() {
  // États principaux de la page
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // États pour gérer l'affichage des modals
  const [editingClient, setEditingClient] = useState(null);
  const [viewingHistory, setViewingHistory] = useState(null);

  // Fonction pour récupérer les clients de l'API
  const fetchClients = () => {
    setIsLoading(true);
    setError(null);
    apiClient.get('/api/admin/clients')
      .then(res => setClients(res.data))
      .catch(err => {
        console.error("Failed to fetch clients:", err);
        setError("Impossible de charger les données des clients.");
      })
      .finally(() => setIsLoading(false));
  };
  
  // Exécuter fetchClients au premier chargement du composant
  useEffect(() => {
    fetchClients();
  }, []);

  // Fonction pour supprimer un client
  const handleDelete = (clientId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible.")) {
      apiClient.delete(`/api/admin/clients/${clientId}`)
        .then(() => {
            alert("Client supprimé avec succès.");
            fetchClients(); // Recharger la liste après suppression
        })
        .catch(err => alert("Erreur lors de la suppression : " + err.message));
    }
  };

  // Composant pour les badges de statut
  const StatusBadge = ({ status }) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      disabled: 'bg-gray-200 text-gray-800',
      requires_review: 'bg-yellow-100 text-yellow-800',
    };
    return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status] || 'bg-gray-100'}`}>
            {status.replace('_', ' ')}
        </span>
    );
  };
  
  return (
    <div>
      {/* Les modals s'afficheront ici si leur état correspondant n'est pas nul */}
      {editingClient && <EditClientModal client={editingClient} closeModal={() => setEditingClient(null)} onSave={fetchClients} />}
      {viewingHistory && <HistoryModal client={viewingHistory} closeModal={() => setViewingHistory(null)} />}

      <h2 className="text-3xl font-bold text-gray-800 mb-6">Gestion des Clients</h2>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {isLoading ? <div className="p-8 text-center">Chargement des clients...</div> :
         error ? <div className="p-8 text-center text-red-600">{error}</div> : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left">
                  <th className="p-3 font-semibold text-gray-600">Nom</th>
                  <th className="p-3 font-semibold text-gray-600">ID (Flower)</th>
                  <th className="p-3 font-semibold text-gray-600">Statut</th>
                  <th className="p-3 font-semibold text-gray-600">Enregistré le</th>
                  <th className="p-3 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {clients.map(client => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-800 whitespace-nowrap">{client.name}</td>
                    <td className="p-3 text-gray-500 font-mono text-xs">{client.flower_id}</td>
                    <td className="p-3"><StatusBadge status={client.status} /></td>
                    <td className="p-3 text-gray-500">{new Date(client.registered_at).toLocaleDateString()}</td>
                    <td className="p-3 space-x-4 whitespace-nowrap">
                      <button onClick={() => setViewingHistory(client)} className="font-semibold text-blue-600 hover:underline">Historique</button>
                      <button onClick={() => setEditingClient(client)} className="font-semibold text-indigo-600 hover:underline">Modifier</button>
                      <button onClick={() => handleDelete(client.id)} className="font-semibold text-red-600 hover:underline">Supprimer</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}