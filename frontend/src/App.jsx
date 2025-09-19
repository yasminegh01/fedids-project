// frontend/src/App.jsx

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Importer les composants de contrôle
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

// Importer les Layouts
import UserDashboardLayout from './layouts/UserDashboardLayout';
import AdminDashboardLayout from './layouts/AdminDashboardLayout';

// Importer TOUTES les pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import VerifyEmailPage from './pages/VerifyEmailPage';

// Pages Utilisateur
import UserDashboard from './pages/User_Dashboard';
import UserDevices from './pages/User_Devices';
import UserProfile from './pages/User_Profile';
import UserUpgradePage from './pages/User_UpgradePage'; 

// === IMPORTS ADMIN MANQUANTS ===
import AdminDashboardView from './pages/Admin_DashboardView';
import AdminClientManagement from './pages/Admin_ClientManagement';
import AdminAttackHistory from './pages/Admin_AttackHistory';

export default function App() {
  return (
    <Routes>
      {/* --- Routes Publiques --- */}
      <Route path="/" element={<PublicRoute><HomePage /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignUpPage /></PublicRoute>} />
      <Route path="/verify-email" element={<PublicRoute><VerifyEmailPage /></PublicRoute>} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      
      {/* --- Routes Protégées Utilisateur --- */}
      <Route path="/dashboard" element={<ProtectedRoute><UserDashboardLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<UserDashboard />} />
        <Route path="devices" element={<UserDevices />} />
        <Route path="profile" element={<UserProfile />} />
        <Route path="upgrade" element={<UserUpgradePage />} />
      </Route>
      
       {/* --- Routes Protégées Admin --- */}
      <Route 
        path="/admin" 
        element={<ProtectedRoute requiredRole="admin"><AdminDashboardLayout /></ProtectedRoute>}
      >
        <Route index element={<Navigate to="overview" replace />} />
        {/* Le chemin "overview" correspond bien au lien "/admin/overview" */}
        <Route path="overview" element={<AdminDashboardView />} />
        <Route path="clients" element={<AdminClientManagement />} />
        <Route path="attacks" element={<AdminAttackHistory />} />
      </Route>
      
      {/* --- Page 404 --- */}
      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  );
}