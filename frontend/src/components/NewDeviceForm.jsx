import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { validateDeviceName, validateIpAddress, validateMacAddress } from '../validators';

export default function NewDeviceForm({ onRegister, isLoading }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        ip_address: '',
        mac_address: '',
        category_id: ''
    });

    const [categories, setCategories] = useState([]);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        apiClient.get('/api/device-categories')
            .then(res => setCategories(res.data))
            .catch(() => setErrors({ global: "Could not load device categories." }));
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // On efface l'erreur du champ dès que l'utilisateur recommence à taper
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };
    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return;
        try {
            const response = await apiClient.post('/api/device-categories', { name: newCategoryName });
            setCategories(prev => [...prev, response.data]);
            setNewCategoryName('');
            setIsAddingCategory(false);
        } catch {
            setErrors({ global: "Failed to add category." });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Lancer la validation pour chaque champ
        const nameError = validateDeviceName(formData.name);
        const ipError = validateIpAddress(formData.ip_address);
        const macError = validateMacAddress(formData.mac_address);
        
        const newErrors = {};
        if (nameError) newErrors.name = nameError;
        if (ipError) newErrors.ip_address = ipError;
        if (macError) newErrors.mac_address = macError;
        
        // Si on a trouvé des erreurs, on les affiche et on arrête
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        
        // S'il n'y a pas d'erreurs, on appelle la fonction du parent
        onRegister(formData);
        // On vide le formulaire après la soumission
        setFormData({ name: '', description: '', ip_address: '', mac_address: '', category_id: '' });
    };


    return (
        <form onSubmit={handleSubmit} className="space-y-4">
    <div>
        <label className="font-semibold text-sm text-text-secondary">Device Name*</label>
        <input 
            name="name" 
            value={formData.name} 
            onChange={handleInputChange}
            className={`w-full p-2 border rounded mt-1 bg-bg-primary text-text-primary ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} 
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
    </div>

    <div>
        <label className="font-semibold text-sm text-text-secondary">Description</label>
        <textarea 
            name="description" 
            value={formData.description} 
            onChange={handleInputChange} 
            rows="3"
            className="w-full p-2 border rounded mt-1 bg-bg-primary text-text-primary border-gray-300 dark:border-gray-600"
        ></textarea>
    </div>

    <div className="grid grid-cols-2 gap-4">
        <div>
            <label className="font-semibold text-sm text-text-secondary">IP Address</label>
            <input 
                name="ip_address" 
                value={formData.ip_address} 
                onChange={handleInputChange} 
                placeholder="e.g., 192.168.1.10"
                className={`w-full p-2 border rounded mt-1 bg-bg-primary text-text-primary ${errors.ip_address ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} 
            />
            {errors.ip_address && <p className="text-red-500 text-xs mt-1">{errors.ip_address}</p>}
        </div>
        <div>
            <label className="font-semibold text-sm text-text-secondary">MAC Address</label>
            <input 
                name="mac_address" 
                value={formData.mac_address} 
                onChange={handleInputChange} 
                placeholder="e.g., 00:1A:2B:3C:4D:5E"
                className={`w-full p-2 border rounded mt-1 bg-bg-primary text-text-primary ${errors.mac_address ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`} 
            />
            {errors.mac_address && <p className="text-red-500 text-xs mt-1">{errors.mac_address}</p>}
        </div>
    </div>

    <div>
        <label className="block font-semibold text-sm text-text-secondary">Category / Location</label>
        <div className="flex gap-2 mt-1">
            <select 
                name="category_id" 
                value={formData.category_id} 
                onChange={handleInputChange} 
                className="flex-grow p-2 border border-gray-300 dark:border-gray-600 bg-bg-primary text-text-primary rounded"
            >
                <option value="">No Category</option>
                {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
            </select>
            <button 
                type="button" 
                onClick={() => setIsAddingCategory(!isAddingCategory)} 
                className="p-2 bg-bg-secondary text-text-primary rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            >
                {isAddingCategory ? '−' : '+'}
            </button>
        </div>
    </div>

    {isAddingCategory && (
        <div className="flex items-center gap-2 p-2 border border-gray-300 dark:border-gray-600 rounded">
            <input 
                value={newCategoryName} 
                onChange={e => setNewCategoryName(e.target.value)} 
                placeholder="New category name..." 
                className="flex-grow p-2 border-none bg-transparent text-text-primary focus:outline-none" 
            />
            <button 
                type="button" 
                onClick={handleAddCategory} 
                className="px-4 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
            >
                Add
            </button>
        </div>
    )}

    <button 
        type="submit" 
        disabled={isLoading} 
        className="w-full p-2 bg-accent hover:bg-accent-hover text-white rounded font-semibold disabled:bg-gray-400"
    >
        {isLoading ? 'Registering...' : 'Register Device'}
    </button>
</form>
    );
}
