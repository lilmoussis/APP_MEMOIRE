/**
 * Composant Layout principal
 * Gère la structure générale de l'application avec authentification et gestion des rôles
 * Ce composant sert de "gardien de route" (route guard) pour les pages protégées
 */

import { useEffect } from 'react'; // Hook React pour les effets de bord
import { Navigate } from 'react-router-dom'; // Composant pour la redirection
import Sidebar from './Sidebar'; // Composant de la barre latérale
import Navbar from './Navbar'; // Composant de la barre de navigation supérieure
import { useAuthStore } from '../store'; // Store Zustand pour la gestion de l'authentification
import socketService from '../services/socket.service'; // Service pour la connexion WebSocket

/**
 * Composant Layout - Enveloppe principal de l'application
 * @param {Object} props - Les propriétés du composant
 * @param {React.ReactNode} props.children - Les composants enfants à afficher dans le layout
 * @param {string|null} props.requiredRole - Rôle requis pour accéder à la page (optionnel)
 * @returns {JSX.Element} Le layout avec vérifications d'authentification
 */
export default function Layout({ children, requiredRole = null }) {
  // Extraction de l'état d'authentification depuis le store Zustand
  const { isAuthenticated, user } = useAuthStore();
  
  /**
   * useEffect pour gérer la connexion/déconnexion WebSocket
   * S'exécute à chaque changement de l'état d'authentification
   */
  useEffect(() => {
    // Se connecte au WebSocket seulement si l'utilisateur est authentifié
    if (isAuthenticated) {
      socketService.connect(); // Établit la connexion WebSocket
      
      /**
       * Fonction de nettoyage (cleanup) exécutée quand le composant est démonté
       * ou quand la dépendance [isAuthenticated] change
       */
      return () => {
        socketService.disconnect(); // Ferme la connexion WebSocket proprement
      };
    }
  }, [isAuthenticated]); // Dépendance : s'exécute quand isAuthenticated change
  
  /**
   * Vérification 1 : Authentification
   * Si l'utilisateur n'est pas authentifié, redirige vers la page de connexion
   */
  if (!isAuthenticated) {
    // Navigate avec 'replace' pour éviter de garder cette page dans l'historique
    return <Navigate to="/login" replace />;
  }
  
  /**
   * Vérification 2 : Autorisation basée sur le rôle
   * Si un rôle spécifique est requis et que l'utilisateur ne l'a pas
   */
  if (requiredRole && user?.role !== requiredRole) {
    // Redirection vers la page "non autorisé"
    return <Navigate to="/unauthorized" replace />;
  }
  
  /**
   * Rendu principal du layout
   * Seulement exécuté si les deux vérifications ci-dessus sont passées
   */
  return (
    // Conteneur principal de l'application
    <div className="app-container">
      {/* Barre latérale - Navigation principale */}
      <Sidebar />
      
      {/* Section du contenu principal */}
      <div className="main-content">
        {/* Barre de navigation supérieure - Header avec informations utilisateur */}
        <Navbar />
        
        {/* Conteneur pour le contenu spécifique à chaque page */}
        <div className="content-wrapper">
          {children} {/* Injection des composants enfants (contenu des pages) */}
        </div>
      </div>
    </div>
  );
}