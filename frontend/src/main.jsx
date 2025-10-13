// frontend/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext'; 
import App from './App.jsx';
import './index.css';
import { ChatbotProvider } from './context/ChatbotContext'; // <<< NOUVEL IMPORT

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 1. Le BrowserRouter enveloppe tout */}
    <BrowserRouter>
      {/* 2. Le AuthProvider enveloppe l'App */}
      <AuthProvider>
        {/* 3. L'App ne contient plus que les Routes */}
        <ThemeProvider> {/* <<< ON ENVELOPPE L'APP */}
           <ChatbotProvider>
            <App />
          </ChatbotProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);