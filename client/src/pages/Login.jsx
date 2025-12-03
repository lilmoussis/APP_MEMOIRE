/**
 * Page de connexion
 * Interface d'authentification avec design moderne et animations
 */

import { useState, useEffect } from 'react'; // Hooks React pour état et effets
import { useNavigate } from 'react-router-dom'; // Hook pour la navigation programmatique
import { LogIn, Lock, User, ParkingSquare } from 'lucide-react'; // Icônes pour l'interface
import toast from 'react-hot-toast'; // Bibliothèque de notifications toast
import { useAuthStore } from '../store'; // Store Zustand pour l'authentification
import { motion } from 'framer-motion'; // Bibliothèque d'animations

export default function Login() {
  // Navigation React Router
  const navigate = useNavigate();
  
  // Récupération des états et actions depuis le store d'authentification
  const { 
    login,           // Fonction de connexion
    isAuthenticated, // État d'authentification (booléen)
    isSuperAdmin,    // Fonction pour vérifier le rôle
    isLoading,       // État de chargement pendant la connexion
    error,           // Erreur éventuelle de connexion
    clearError       // Fonction pour effacer les erreurs
  } = useAuthStore();
  
  // État local pour les identifiants de connexion
  const [credentials, setCredentials] = useState({
    username: '', // Nom d'utilisateur
    password: ''  // Mot de passe
  });
  
  /**
   * useEffect pour la redirection si déjà authentifié
   * Redirige vers le dashboard approprié selon le rôle
   */
  useEffect(() => {
    if (isAuthenticated) {
      // Redirection vers admin ou gérant selon le rôle
      navigate(isSuperAdmin() ? '/admin' : '/gerant');
    }
  }, [isAuthenticated, isSuperAdmin, navigate]); // Dépendances: se relance si ces valeurs changent
  
  /**
   * useEffect pour afficher les erreurs de connexion
   * Transforme les erreurs du store en notifications toast
   */
  useEffect(() => {
    if (error) {
      toast.error(error); // Affiche l'erreur en notification
      clearError();       // Nettoie l'erreur après l'affichage
    }
  }, [error, clearError]); // Dépendances: erreur et fonction de nettoyage
  
  /**
   * Gère la soumission du formulaire de connexion
   * @param {Event} e - Événement de soumission du formulaire
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Empêche le rechargement de la page
    
    // Validation des champs obligatoires
    if (!credentials.username || !credentials.password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    
    try {
      // Appel de la fonction de connexion du store
      await login(credentials);
      toast.success('Connexion réussie'); // Confirmation de succès
    } catch (err) {
      // L'erreur est déjà gérée par le store et le useEffect ci-dessus
    }
  };
  
  /**
   * Gère les changements dans les champs du formulaire
   * @param {Event} e - Événement de changement d'input
   */
  const handleChange = (e) => {
    setCredentials({
      ...credentials, // Conserve les autres valeurs
      [e.target.name]: e.target.value // Met à jour uniquement le champ modifié
    });
  };
  
  return (
    // Conteneur principal avec deux colonnes
    <div className="login-container">
      {/* Section gauche - Visuel et branding */}
      <div className="login-visual">
        {/* Overlay pour effet visuel */}
        <div className="login-visual-overlay"></div>
        
        {/* Contenu du visuel avec animation */}
        <div className="login-visual-content">
          <motion.div
            initial={{ opacity: 0, y: -20 }} // État initial: invisible et décalé vers le haut
            animate={{ opacity: 1, y: 0 }}   // État final: visible et à sa position normale
            transition={{ duration: 0.6 }}   // Durée de l'animation
          >
            {/* Logo animé */}
            <div className="login-logo-circle">
              <ParkingSquare size={48} strokeWidth={1.5} /> {/* Icône du parking */}
            </div>
            
            {/* Nom de l'application */}
            <h1 className="login-brand">SmartPark</h1>
            
            {/* Slogan */}
            <p className="login-tagline">Gestion intelligente de parking</p>
          </motion.div>
        </div>
      </div>

      {/* Section droite - Formulaire de connexion */}
      <div className="login-form-section">
        <motion.div 
          className="login-form-wrapper"
          initial={{ opacity: 0, x: 20 }}   // État initial: invisible et décalé à droite
          animate={{ opacity: 1, x: 0 }}    // État final: visible et à sa position normale
          transition={{ duration: 0.6, delay: 0.2 }} // Animation avec léger délai
        >
          {/* En-tête du formulaire */}
          <div className="login-header">
            <h2 className="login-title">Connexion</h2>
            <p className="login-subtitle">Accédez à votre espace de gestion</p>
          </div>
          
          {/* Formulaire de connexion */}
          <form onSubmit={handleSubmit} className="login-form">
            {/* Champ nom d'utilisateur */}
            <div className="form-group">
              <label htmlFor="username" className="form-label-modern">
                Nom d'utilisateur
              </label>
              <div className="input-wrapper">
                <User size={18} className="input-icon" /> {/* Icône utilisateur */}
                <input
                  type="text"
                  className="form-input-modern"
                  id="username"
                  name="username" // Correspond à la clé dans l'état credentials
                  value={credentials.username}
                  onChange={handleChange}
                  placeholder="Entrez votre nom d'utilisateur"
                  disabled={isLoading} // Désactivé pendant le chargement
                  autoComplete="username" // Aide à l'autocomplétion du navigateur
                />
              </div>
            </div>
            
            {/* Champ mot de passe */}
            <div className="form-group">
              <label htmlFor="password" className="form-label-modern">
                Mot de passe
              </label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" /> {/* Icône cadenas */}
                <input
                  type="password"
                  className="form-input-modern"
                  id="password"
                  name="password" // Correspond à la clé dans l'état credentials
                  value={credentials.password}
                  onChange={handleChange}
                  placeholder="Entrez votre mot de passe"
                  disabled={isLoading} // Désactivé pendant le chargement
                  autoComplete="current-password" // Aide à l'autocomplétion du navigateur
                />
              </div>
            </div>
            
            {/* Bouton de soumission */}
            <button
              type="submit"
              className="btn-login-modern"
              disabled={isLoading} // Désactivé pendant le chargement
            >
              {/* Affichage conditionnel: spinner pendant chargement, sinon texte normal */}
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Connexion en cours...
                </>
              ) : (
                <>
                  <LogIn size={18} className="me-2" /> {/* Icône connexion */}
                  Se connecter
                </>
              )}
            </button>
          </form>
          
          {/* Pied de page */}
          <div className="login-footer">
            <p>&copy; 2025 SmartPark. Tous droits réservés.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}