/**
 * Page de connexion
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Lock, User, ParkingSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store';
import { motion } from 'framer-motion';

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isSuperAdmin, isLoading, error, clearError } = useAuthStore();
  
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  
  // Rediriger si deja authentifie
  useEffect(() => {
    if (isAuthenticated) {
      navigate(isSuperAdmin() ? '/admin' : '/gerant');
    }
  }, [isAuthenticated, isSuperAdmin, navigate]);
  
  // Afficher les erreurs
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!credentials.username || !credentials.password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    
    try {
      await login(credentials);
      toast.success('Connexion reussie');
    } catch (err) {
      // L'erreur est deja geree par le store
    }
  };
  
  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };
  
  return (
    <div className="login-container">
      {/* Section gauche - Image parking */}
      <div className="login-visual">
        <div className="login-visual-overlay"></div>
        <div className="login-visual-content">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="login-logo-circle">
              <ParkingSquare size={48} strokeWidth={1.5} />
            </div>
            <h1 className="login-brand">SmartPark</h1>
            <p className="login-tagline">Gestion intelligente de parking</p>
          </motion.div>
        </div>
      </div>

      {/* Section droite - Formulaire */}
      <div className="login-form-section">
        <motion.div 
          className="login-form-wrapper"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Header */}
          <div className="login-header">
            <h2 className="login-title">Connexion</h2>
            <p className="login-subtitle">Accedez a votre espace de gestion</p>
          </div>
          
          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username" className="form-label-modern">
                Nom d'utilisateur
              </label>
              <div className="input-wrapper">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  className="form-input-modern"
                  id="username"
                  name="username"
                  value={credentials.username}
                  onChange={handleChange}
                  placeholder="Entrez votre nom d'utilisateur"
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="password" className="form-label-modern">
                Mot de passe
              </label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  className="form-input-modern"
                  id="password"
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  placeholder="Entrez votre mot de passe"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
              </div>
            </div>
            
            <button
              type="submit"
              className="btn-login-modern"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Connexion en cours...
                </>
              ) : (
                <>
                  <LogIn size={18} className="me-2" />
                  Se connecter
                </>
              )}
            </button>
          </form>
          
          {/* Footer */}
          <div className="login-footer">
            <p>&copy; 2025 SmartPark. Tous droits reserves.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

