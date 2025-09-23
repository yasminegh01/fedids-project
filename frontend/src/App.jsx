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
import ForgotPasswordPage from './pages/ForgotPasswordPage'; // <-- NOUVEL IMPORT
import ResetPasswordPage from './pages/ResetPasswordPage';   // <-- NOUVEL IMPORT
// === IMPORTS ADMIN MANQUANTS ===
import AdminDashboardView from './pages/Admin_DashboardView';
import AdminClientManagement from './pages/Admin_ClientManagement';
import AdminAttackHistory from './pages/Admin_AttackHistory';
import AdminUserManagement from './pages/Admin_UserManagement'; 
import AdminUserDetails from './pages/Admin_UserDetails'; // N'oubliez pas l'import
import AdminModelAnalysis from './pages/Admin_ModelAnalysis';
import AdminModelPerformance from './pages/Admin_ModelPerformance'; // N'oubliez pas l'import
import AdminFLMonitoring from './pages/Admin_FL_Monitoring'; // <-- NOUVEL IMPORT
import UserSupportPage from './pages/User_SupportPage';
import AdminTicketsPage from './pages/Admin_TicketsPage';

export default function App() {
  return (
    <Routes>
      {/* --- Routes Publiques --- */}
      <Route path="/" element={<PublicRoute><HomePage /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignUpPage /></PublicRoute>} />
      <Route path="/verify-email" element={<PublicRoute><VerifyEmailPage /></PublicRoute>} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
      <Route path="/reset-password" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
      
      
      {/* --- Routes Protégées Utilisateur --- */}
      <Route path="/dashboard" element={<ProtectedRoute><UserDashboardLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<UserDashboard />} />
        <Route path="devices" element={<UserDevices />} />
        <Route path="profile" element={<UserProfile />} />
        <Route path="upgrade" element={<UserUpgradePage />} />
                <Route path="support" element={<UserSupportPage />} />

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
        <Route path="users" element={<AdminUserManagement />} />
        <Route path="attacks" element={<AdminAttackHistory />} />
        <Route path="users/:userId" element={<AdminUserDetails />} /> 
        <Route path="analysis" element={<AdminModelAnalysis />} />
        <Route path="performance" element={<AdminModelPerformance />} />
    <Route path="federated-learning" element={<AdminFLMonitoring />} />
        <Route path="tickets" element={<AdminTicketsPage />} />


      </Route>
      
      {/* --- Page 404 --- */}
      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  );
}