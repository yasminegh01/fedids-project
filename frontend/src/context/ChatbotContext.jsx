// frontend/src/context/ChatbotContext.jsx

import React, { createContext, useState, useContext } from 'react';

// 1. Créer le contexte
const ChatbotContext = createContext();

// 2. Créer le "Provider" qui enveloppera notre application
export const ChatbotProvider = ({ children }) => {
    // On stocke le message initial que l'on veut envoyer
    const [initialMessage, setInitialMessage] = useState(null);

    // C'est la fonction que le bouton "Get Advice" appellera
    const requestAdvice = (attack) => {
        const question = `Tell me more about the detected ${attack.attack_type} attack from ${attack.source_ip}. What are the risks and what should I do?`;
        setInitialMessage(question);
    };

    // On fournit la fonction et l'état aux composants enfants
    const value = { requestAdvice, initialMessage, setInitialMessage };

    return (
        <ChatbotContext.Provider value={value}>
            {children}
        </ChatbotContext.Provider>
    );
};

// 3. Créer un hook personnalisé pour un accès facile
export const useChatbot = () => {
    return useContext(ChatbotContext);
};