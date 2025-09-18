// frontend/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 1. Le BrowserRouter enveloppe tout */}
    <BrowserRouter>
      {/* 2. Le AuthProvider enveloppe l'App */}
      <AuthProvider>
        {/* 3. L'App ne contient plus que les Routes */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);