import React, { useState, useRef, useEffect } from 'react';
import apiClient from '../api/apiClient';

// Icône d'envoi

// Icône d'envoi
const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
    </svg>
);

// Composant pour afficher un seul message
const ChatMessage = ({ message }) => {
    const isModel = message.role === 'model';
    return (
        <div className={`flex ${isModel ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-lg px-4 py-2 rounded-2xl ${
                isModel 
                    ? 'bg-gray-700 text-gray-200' // Bulle du modèle
                    : 'bg-indigo-600 text-white' // Bulle de l'utilisateur
            }`}>
                <p className="text-sm">{message.text}</p>
            </div>
        </div>
    );
};

// Composant principal du Chatbot
export default function PremiumChatbot() {
    const [history, setHistory] = useState([
        { role: 'model', text: "Hello! I'm FedIds Assist. How can I help you understand IIoT security threats today?" }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [history]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading) return;

        const newHistory = [...history, { role: 'user', text: userInput }];
        setHistory(newHistory);
        setUserInput('');
        setIsLoading(true);

        try {
            const response = await apiClient.post('/api/chatbot/query', {
                question: userInput,
                history: history // On envoie l'historique précédent pour le contexte
            });
            
            const modelResponse = response.data.answer;
            setHistory([...newHistory, { role: 'model', text: modelResponse }]);

        } catch (error) {
            const errorMessage = error.response?.data?.detail || "Sorry, I'm having trouble connecting. Please try again later.";
            setHistory([...newHistory, { role: 'model', text: errorMessage }]);
        } finally {
            setIsLoading(false);
        }
    };



    return (
        // Fond sombre, texte clair
        <div className="bg-gray-800 rounded-lg shadow-md h-full flex flex-col">
            <div className="p-4 border-b border-gray-700">
                <h3 className="font-bold text-lg text-white">FedIds AI Assistant</h3>
                <p className="text-xs text-gray-400">Premium Feature</p>
            </div>

            {/* Conteneur des messages */}
            <div ref={chatContainerRef} className="flex-1 p-4 space-y-4 overflow-y-auto">
                {history.map((msg, index) => (
                    <ChatMessage key={index} message={msg} />
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="max-w-lg px-4 py-2 rounded-2xl bg-gray-700 text-gray-400 animate-pulse">
                            Typing...
                        </div>
                    </div>
                )}
            </div>

            {/* Zone de saisie */}
            <div className="p-4 border-t border-gray-700">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Ask about an attack type..."
                        className="flex-1 w-full px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={isLoading}
                    />
                    <button 
            type="submit" 
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:bg-gray-500 transition-colors"
            disabled={isLoading}
        >
            <SendIcon />
        </button>
                </form>
            </div>
        </div>
    );
}