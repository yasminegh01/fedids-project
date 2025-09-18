// frontend/src/components/Chatbot.jsx

import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import axios from 'axios';

// apiClient configuré
const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000',
});
apiClient.interceptors.request.use(config => {
  config.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
  return config;
});

// Le composant est enveloppé dans forwardRef pour accepter une ref de son parent
const Chatbot = forwardRef((props, ref) => {
  // === LA CORRECTION EST ICI : l'état initial doit être un tableau ===
  const [messages, setMessages] = useState([
    { sender: 'bot', message: 'Hello! I am the FedIds security assistant. Ask me about a detected threat.' }
  ]);
  // =============================================================
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Pour scroller automatiquement en bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (messageText) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage = { sender: 'user', message: messageText };
    setMessages(prev => [...prev, userMessage]);
    if (messageText === input) setInput(''); // Vider le champ uniquement si envoyé depuis l'input
    setIsLoading(true);

    try {
      const response = await apiClient.post('/api/chatbot/query', { query: messageText });
      setMessages(prev => [...prev, response.data]);
    } catch (error) {
      const errorMsg = { sender: 'bot', message: 'Sorry, I had trouble processing that request.' };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  // Exposer la fonction `askQuestion` pour qu'un parent puisse l'appeler via une ref
  useImperativeHandle(ref, () => ({
    askQuestion(question) {
      sendMessage(question);
    }
  }));

  return (
    <div className="bg-white p-4 rounded-lg shadow-md flex flex-col h-full max-h-[42rem]">
      <h3 className="font-semibold text-gray-700 mb-4 border-b pb-2">Security Assistant</h3>
      <div className="flex-grow overflow-y-auto mb-4 pr-2">
        {/* C'est ici que l'erreur 'map of undefined' se produisait. C'est maintenant corrigé. */}
        {messages.map((msg, index) => (
          <div key={index} className={`flex my-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3 rounded-lg max-w-xs break-words ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
              {msg.message}
            </div>
          </div>
        ))}
        {isLoading && <div className="flex my-2 justify-start"><div className="p-3 rounded-lg bg-gray-200 text-gray-800">...</div></div>}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleFormSubmit} className="flex gap-2">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask a question..." className="flex-grow border rounded-md p-2 text-sm" disabled={isLoading} />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md font-semibold text-sm" disabled={isLoading}>Send</button>
      </form>
    </div>
  );
});

export default Chatbot;