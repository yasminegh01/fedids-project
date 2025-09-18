import axios from 'axios';

const apiClient = axios.create({ baseURL: 'http://127.0.0.1:8000' });

apiClient.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// === INTERCEPTEUR DE RÉPONSE (LA PARTIE IMPORTANTE) ===
apiClient.interceptors.response.use(
    (response) => response, // Ne rien faire pour les réponses réussies
    (error) => {
        // Si l'erreur est une "401 Unauthorized"
        if (error.response && error.response.status === 401) {
            // Supprimer les infos de l'utilisateur invalides
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Forcer le rechargement vers la page de login
            window.location.href = '/login';
            // On peut ajouter un message
            alert("Your session has expired. Please log in again.");
        }
        return Promise.reject(error);
    }
);

export default apiClient;