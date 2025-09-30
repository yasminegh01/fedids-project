import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import NewDeviceForm from '../components/NewDeviceForm';

// --- Icons ---
const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const StatusIndicator = ({ status }) => {
  const isOnline = status === 'online';
  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-3 w-3">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'} opacity-75`}></span>
        <span className={`relative inline-flex rounded-full h-3 w-3 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
      </span>
      <span className={`text-sm font-semibold capitalize ${isOnline ? 'text-green-800' : 'text-red-700'}`}>
        {status || 'offline'}
      </span>
    </div>
  );
};

const PreventionPanel = ({ device }) => {
  const { user } = useAuth();
  const [isEnabled, setIsEnabled] = useState(device.prevention_enabled);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    if (user.role !== 'premium') {
      alert("This is a premium feature.");
      return;
    }
    setIsLoading(true);
    try {
      await apiClient.post(`/api/devices/${device.id}/toggle-prevention`, { enabled: !isEnabled });
      setIsEnabled(!isEnabled);
    } catch (error) {
      console.error("Failed to update prevention status", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isOffline = device.status_info?.status !== 'online';
  const isPremium = user.role === 'premium';

  return (
    <div className={`mt-4 p-4 rounded-lg transition ${!isPremium ? 'bg-bg-secondary opacity-60 cursor-not-allowed' : (isOffline ? 'bg-bg-secondary' : 'bg-green-50 dark:bg-green-900/20')}`}>
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-bold text-text-primary">Intelligent Prevention</h4>
          <p className="text-xs text-text-secondary">{!isPremium ? 'Upgrade to Premium to enable' : (isOffline ? 'Device is offline' : 'Active threat blocking')}</p>
        </div>
        <label className="inline-flex items-center cursor-pointer">
          <input type="checkbox" checked={isEnabled} onChange={handleToggle} disabled={isLoading || isOffline || !isPremium} className="sr-only peer" />
          <div className="relative w-11 h-6 bg-gray-200 dark:bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent peer-disabled:bg-gray-300 dark:peer-disabled:bg-gray-500"></div>
        </label>
      </div>
    </div>
  );
};

export default function UserDevices() {
  const [devices, setDevices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedRegToken, setGeneratedRegToken] = useState(null);
  const { user } = useAuth();
  const SERVER_IP = "192.168.1.12";

  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const fetchDevices = useCallback(async () => {
    try {
      const res = await apiClient.get('/api/devices/my-devices-with-status');
      setDevices(res.data);
    } catch (err) {
      setError('Could not fetch devices.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
        try {
            const response = await apiClient.get('/api/device-categories');
            setCategories(response.data); // Mettre à jour l'état avec les catégories reçues
        } catch (err) {
            console.error("Failed to load device categories:", err);
            // Optionnel : afficher une erreur à l'utilisateur
             setError("Could not load categories for filtering.");
        }
    }, []); 

  useEffect(() => {
    fetchDevices();
    fetchCategories();
    const intervalId = setInterval(fetchDevices, 15000);
    return () => clearInterval(intervalId);
  }, [fetchDevices, fetchCategories]);

  const filteredDevices = useMemo(() => {
    return devices.filter(device => {
      const categoryMatch = categoryFilter === 'all' || String(device.category?.id) === categoryFilter;
      const statusMatch = statusFilter === 'all' || (device.status_info?.status || 'offline') === statusFilter;
      return categoryMatch && statusMatch;
    });
  }, [devices, categoryFilter, statusFilter]);

  const handleRegisterDevice = async (formData) => {
    setIsSubmitting(true);
    setError('');
    setGeneratedRegToken(null);

    try {
      const payload = { ...formData, category_id: formData.category_id ? parseInt(formData.category_id) : null };
      const response = await apiClient.post('/api/devices/register', payload);
      setGeneratedRegToken(response.data.registration_token);
      await fetchDevices();
    } catch (err) {
      setError(err.response?.data?.detail || "Device registration failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDevice = async (deviceId) => {
    if (window.confirm("Are you sure you want to delete this device?")) {
      try {
        await apiClient.delete(`/api/devices/${deviceId}`);
        fetchDevices();
      } catch {
        alert("Failed to delete the device.");
      }
    }
  };

  const handleEdit = (device) => {
    setEditingId(device.id);
    setEditData({
      name: device.name,
      ip_address: device.ip_address || '',
      mac_address: device.mac_address || '',
      description: device.description || '',
    });
  };

  const handleSave = async (deviceId) => {
    // Validation
    const ipv4Regex = /^(25[0-5]|2[0-4]\d|1\d\d|\d\d|\d)(\.(25[0-5]|2[0-4]\d|1\d\d|\d\d|\d)){3}$/;
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    if (!editData.name.trim()) { alert("Device name is required"); return; }
    if (editData.ip_address && !ipv4Regex.test(editData.ip_address)) { alert("Invalid IP address"); return; }
    if (editData.mac_address && !macRegex.test(editData.mac_address)) { alert("Invalid MAC address"); return; }

    try {
      await apiClient.put(`/api/devices/${deviceId}`, editData);
      setEditingId(null);
      fetchDevices();
    } catch {
      alert("Failed to save changes.");
    }
  };

  const handleCancel = () => setEditingId(null);

  const installCommand = generatedRegToken ? `bash <(curl -s http://${SERVER_IP}:8000/api/devices/install/${generatedRegToken})` : '';

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => alert("Command copied!"));
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-text-primary">Manage Your Devices</h1>

      {generatedRegToken && (
        <div className="p-4 bg-blue-100 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-r-lg shadow-lg">
          <h4 className="font-bold text-blue-800 dark:text-blue-300">Device Registration Initiated!</h4>
          <p className="text-sm my-2 text-blue-700 dark:text-blue-400">Run the following command on your new IIoT device's terminal:</p>
          <div className="flex items-center justify-between gap-4 bg-gray-800 text-white p-3 rounded-md">
            <pre className="font-mono text-sm overflow-x-auto">{installCommand}</pre>
            <button onClick={() => copyToClipboard(installCommand)} className="p-2 rounded hover:bg-gray-600"><CopyIcon /></button>
          </div>
          <button onClick={() => setGeneratedRegToken(null)} className="mt-3 text-xs font-semibold text-text-secondary hover:underline">Dismiss</button>
        </div>
      )}

      <div className="bg-bg-primary p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4 text-text-primary">Register a New IIoT Device</h3>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <NewDeviceForm onRegister={handleRegisterDevice} isLoading={isSubmitting} />
      </div>

      <div className="bg-bg-primary p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4 text-text-primary">Your Registered Devices</h3>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-6 p-4 mb-4 border-b border-gray-200 dark:border-gray-700">
    <div className="flex items-center gap-2">
        <label className="font-semibold text-sm text-text-secondary">Filter by Category:</label>
        <select 
            onChange={e => setCategoryFilter(e.target.value)} 
            value={categoryFilter} 
            className="p-1 border border-gray-300 dark:border-gray-600 bg-bg-primary text-text-primary rounded-md text-sm"
        >
            <option value="all">All Categories</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
        </select>
    </div>
    <div className="flex items-center gap-2">
        <label className="font-semibold text-sm text-text-secondary">Filter by Status:</label>
        <select 
            onChange={e => setStatusFilter(e.target.value)} 
            value={statusFilter} 
            className="p-1 border border-gray-300 dark:border-gray-600 bg-bg-primary text-text-primary rounded-md text-sm"
        >
            <option value="all">All</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
        </select>
    </div>
        </div>

        {isLoading && <p className="text-text-secondary">Loading your devices...</p>}
        {!isLoading && filteredDevices.length === 0 && <p className="text-text-secondary py-4">No devices match the current filters.</p>}

        {filteredDevices.length > 0 && (
    <div className="space-y-6">
        {filteredDevices.map(device => (
            <div key={device.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm bg-bg-primary">
                <div className="flex justify-between items-start">
                    <div className="flex-grow">
                        {editingId === device.id ? (
                            // --- Formulaire d'Édition Thématique ---
                            <div className="space-y-2">
                                <input 
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-bg-secondary text-text-primary rounded" 
                                    value={editData.name} 
                                    onChange={e => setEditData({ ...editData, name: e.target.value })} 
                                />
                                <input 
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-bg-secondary text-text-primary rounded" 
                                    placeholder="IP Address" 
                                    value={editData.ip_address} 
                                    onChange={e => setEditData({ ...editData, ip_address: e.target.value })} 
                                />
                                <input 
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-bg-secondary text-text-primary rounded" 
                                    placeholder="MAC Address" 
                                    value={editData.mac_address} 
                                    onChange={e => setEditData({ ...editData, mac_address: e.target.value })} 
                                />
                                <textarea 
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-bg-secondary text-text-primary rounded" 
                                    placeholder="Description" 
                                    value={editData.description} 
                                    onChange={e => setEditData({ ...editData, description: e.target.value })} 
                                />
                                <div className="flex gap-2 pt-2">
                                    <button 
                                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-semibold" 
                                        onClick={() => handleSave(device.id)}
                                    >
                                        Save
                                    </button>
                                    <button 
                                        className="bg-bg-secondary hover:bg-gray-300 dark:hover:bg-gray-600 text-text-primary px-3 py-1 rounded text-sm font-semibold" 
                                        onClick={handleCancel}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                      <>
                        <p className="font-bold text-lg text-text-primary">{device.name}</p>
                        <p className="text-xs text-text-secondary font-mono mt-1">API Key: <code>{device.api_key}</code></p>
                        {device.category_id && <p className="text-xs text-text-secondary">Category: {device.category_id}</p>}
                        {device.created_at && <p className="text-xs text-text-secondary">Created: {new Date(device.created_at).toLocaleString()}</p>}
                        {device.description && <p className="text-sm text-text-secondary mt-2">{device.description}</p>}
                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-text-secondary font-mono">
                          {device.ip_address && <p>IP: {device.ip_address}</p>}
                          {device.mac_address && <p>MAC: {device.mac_address}</p>}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <StatusIndicator status={device.status_info?.status || 'offline'} />
                    {editingId === device.id ? null : <button className="text-blue-500" onClick={() => handleEdit(device)}>Edit</button>}
                    <button onClick={() => handleDeleteDevice(device.id)} className="text-text-secondary hover:text-red-500 p-1" title="Delete Device"><TrashIcon /></button>
                  </div>
                </div>

                <PreventionPanel device={device} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
