// frontend/src/hooks/useWebSocket.js
import { useState, useEffect } from 'react';

export const useWebSocket = (path) => {
    const [messages, setMessages] = useState([]);
    const [status, setStatus] = useState('connecting');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setStatus('unauthorized');
            return;
        }

        const wsUrl = `ws://127.0.0.1:8000${path}?token=${token}`;
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => setStatus('connected');
        ws.onclose = () => setStatus('disconnected');
        ws.onerror = () => setStatus('error');

        ws.onmessage = (event) => {
            try {
                const newMessage = JSON.parse(event.data);
                setMessages(prev => [newMessage, ...prev]);
            } catch (e) {
                console.error("Failed to parse WebSocket message:", e);
            }
        };

        return () => ws.close(); // Fonction de nettoyage
    }, [path]); // Se reconnecte si le 'path' change

    return { messages, status };
};