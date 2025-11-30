/**
 * Page de connexion
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Lock, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store';

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
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-5 col-lg-4">
            <div className="card shadow-lg border-0">
              <div className="card-body p-5">
                {/* Logo et titre */}
                <div className="text-center mb-4">
                  <div 
                    className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ width: '80px', height: '80px' }}
                  >
                    <Lock size={40} />
                  </div>
                  <h2 className="fw-bold text-primary mb-1">SmartPark</h2>
                  <p className="text-muted">Systeme de gestion de parking</p>
                </div>
                
                {/* Formulaire */}
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="username" className="form-label">
                      Nom d'utilisateur
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-white">
                        <User size={18} />
                      </span>
                      <input
                        type="text"
                        className="form-control"
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
                  
                  <div className="mb-4">
                    <label htmlFor="password" className="form-label">
                      Mot de passe
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-white">
                        <Lock size={18} />
                      </span>
                      <input
                        type="password"
                        className="form-control"
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
                    className="btn btn-primary w-100 d-flex align-items-center justify-content-center"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Connexion...
                      </>
                    ) : (
                      <>
                        <LogIn size={18} className="me-2" />
                        Se connecter
                      </>
                    )}
                  </button>
                </form>
                
                {/* Comptes de test */}
                <div className="mt-4 pt-3 border-top">
                  <p className="text-muted small text-center mb-2">Comptes de test :</p>
                  <div className="small text-muted">
                    <div className="d-flex justify-content-between mb-1">
                      <span>Super Admin:</span>
                      <span className="fw-bold">admin / admin123456</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Gerant:</span>
                      <span className="fw-bold">gerant / gerant123456</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="text-center mt-3">
              <p className="text-muted small">
                &copy; 2025 SmartPark. Tous droits reserves.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

