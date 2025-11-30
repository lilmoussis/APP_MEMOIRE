/**
 * Composant Layout principal
 * Gere la structure generale de l'application
 */

import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuthStore } from '../store';
import socketService from '../services/socket.service';

export default function Layout({ children, requiredRole = null }) {
  const { isAuthenticated, user } = useAuthStore();
  
  // Connecter Socket.io au montage
  useEffect(() => {
    if (isAuthenticated) {
      socketService.connect();
      
      return () => {
        socketService.disconnect();
      };
    }
  }, [isAuthenticated]);
  
  // Rediriger vers login si non authentifie
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Verifier le role si necessaire
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <div className="content-wrapper">
          {children}
        </div>
      </div>
    </div>
  );
}
