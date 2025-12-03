// Importation des dépendances React
import { StrictMode } from 'react'           // Mode strict de React pour détecter les problèmes
import { createRoot } from 'react-dom/client' // Méthode moderne pour rendre l'application React
import { Toaster } from 'react-hot-toast'    // Composant pour afficher les notifications toast
import 'bootstrap/dist/css/bootstrap.min.css' // Importation des styles CSS de Bootstrap
import 'bootstrap/dist/js/bootstrap.bundle.min.js' // Importation des scripts JavaScript de Bootstrap
import './styles/global.css'                 // Importation des styles CSS personnalisés
import App from './App.jsx'                  // Importation du composant principal App

/**
 * Point d'entrée principal de l'application React
 * 
 * Cette fonction :
 * 1. Sélectionne l'élément DOM racine avec l'ID 'root'
 * 2. Crée une racine React pour cet élément
 * 3. Rendu l'application dans cet élément
 */
createRoot(document.getElementById('root')).render(
  // StrictMode est un wrapper qui active des vérifications supplémentaires en développement
  <StrictMode>
    {/* Composant principal de l'application */}
    <App />
    
    {/* 
      Composant Toaster pour les notifications toast
      Il est placé ici pour être disponible dans toute l'application
    */}
    <Toaster 
      position="top-right"                    // Position des notifications (en haut à droite)
      containerStyle={{                       // Styles du conteneur des toasts
        zIndex: 99999,                        // Valeur z-index très élevée pour être au-dessus de tout
      }}
      toastOptions={{                         // Options de configuration des toasts
        duration: 4000,                       // Durée par défaut d'affichage (4 secondes)
        style: {                              // Styles par défaut des toasts
          background: '#363636',              // Fond gris foncé
          color: '#fff',                      // Texte blanc
          zIndex: 99999,                      // z-index très élevé
        },
        success: {                            // Options spécifiques pour les toasts de succès
          duration: 3000,                     // Durée plus courte (3 secondes)
          iconTheme: {                        // Configuration de l'icône
            primary: '#28a745',               // Couleur principale de l'icône (vert)
            secondary: '#fff',                // Couleur secondaire de l'icône (blanc)
          },
        },
        error: {                              // Options spécifiques pour les toasts d'erreur
          duration: 4000,                     // Durée standard (4 secondes) - plus longue que succès
          iconTheme: {                        // Configuration de l'icône
            primary: '#dc3545',               // Couleur principale de l'icône (rouge)
            secondary: '#fff',                // Couleur secondaire de l'icône (blanc)
          },
        },
      }}
    />
  </StrictMode>,
)

/**
 * Explications détaillées :
 * 
 * 1. STRICT MODE (<StrictMode>)
 *    - Active des vérifications supplémentaires pendant le développement
 *    - Aide à identifier les problèmes potentiels
 *    - Ne s'exécute qu'en mode développement (pas en production)
 *    - Vérifie notamment :
 *      * Les composants avec des effets secondaires non sécurisés
 *      * L'utilisation d'API dépréciées
 *      * La détection d'effets de bord inattendus
 * 
 * 2. REACT HOT TOAST (<Toaster>)
 *    - Système de notifications "toast" moderne et léger
 *    - Positionné en haut à droite pour être discret mais visible
 *    - Configuration de différents types de notifications :
 *      * Succès : vert, durée 3 secondes
 *      * Erreur : rouge, durée 4 secondes
 *      * Par défaut : gris foncé, durée 4 secondes
 *    - z-index élevé (99999) pour s'assurer que les toasts apparaissent
 *      au-dessus de tous les autres éléments de l'interface
 * 
 * 3. BOOTSTRAP
 *    - Bootstrap CSS : Framework CSS pour le design responsive
 *    - Bootstrap JS Bundle : Inclut le JavaScript de Bootstrap avec Popper.js
 *      (nécessaire pour les composants interactifs comme les modales, tooltips, etc.)
 * 
 * 4. STYLES PERSONNALISÉS
 *    - global.css : Contient tous les styles CSS personnalisés de l'application
 * 
 * 5. RENDU DE L'APPLICATION
 *    - createRoot() : Nouvelle API React 18+ pour créer une racine de rendu
 *    - document.getElementById('root') : Sélectionne l'élément DOM avec ID 'root'
 *    - .render() : Méthode qui effectue le rendu de l'application React
 * 
 * Structure du DOM attendue dans index.html :
 *    <div id="root"></div>
 * 
 * Organisation des imports :
 *    1. React et ses dépendances
 *    2. Bibliothèques tierces (Bootstrap, react-hot-toast)
 *    3. Styles (CSS)
 *    4. Composants de l'application
 */