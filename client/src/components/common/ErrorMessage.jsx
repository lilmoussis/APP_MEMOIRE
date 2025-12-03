/**
 * Composant ErrorMessage (Affichage d'erreurs)
 * Affiche un message d'erreur stylisé avec option de réessai
 * Utilisé pour montrer les erreurs de chargement, d'API, de validation, etc.
 * Améliore l'UX en fournissant un feedback clair et une action corrective
 */

import { AlertCircle } from 'lucide-react'; // Icône d'alerte/erreur

/**
 * Composant ErrorMessage
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {string} [props.message='Une erreur est survenue'] - Message d'erreur à afficher
 * @param {Function} [props.onRetry=null] - Fonction de rappel pour réessayer l'action (optionnelle)
 * @param {string} [props.className=''] - Classes CSS additionnelles pour personnalisation
 * 
 * @returns {JSX.Element} Message d'erreur stylisé avec option de réessai
 * 
 * @example
 * // Utilisation simple
 * <ErrorMessage />
 * 
 * @example
 * // Avec message personnalisé
 * <ErrorMessage message="Impossible de charger les données utilisateurs" />
 * 
 * @example
 * // Avec action de réessai
 * <ErrorMessage 
 *   message="Échec de connexion au serveur"
 *   onRetry={fetchData}
 * />
 * 
 * @example
 * // Avec classes personnalisées
 * <ErrorMessage 
 *   message="Validation échouée"
 *   className="my-3"
 * />
 */
export default function ErrorMessage({ 
  message = 'Une erreur est survenue', // Message d'erreur par défaut
  onRetry = null, // Fonction de réessai optionnelle
  className = ''  // Classes CSS additionnelles
}) {
  /**
   * Rendu du composant ErrorMessage
   */
  return (
    // Conteneur principal utilisant les classes d'alerte Bootstrap
    // `alert alert-danger` : style d'alerte rouge (danger) Bootstrap
    // `d-flex align-items-center` : layout flexbox avec alignement vertical au centre
    // `${className}` : classes CSS personnalisées passées en props
    // `role="alert"` : attribut ARIA pour l'accessibilité (indique un message d'alerte)
    <div 
      className={`alert alert-danger d-flex align-items-center ${className}`} 
      role="alert"
    >
      {/* Icône d'erreur avec marge à droite */}
      <AlertCircle size={24} className="me-2" />
      
      {/* Contenu du message (prend l'espace disponible) */}
      <div className="flex-grow-1">
        {message}
      </div>
      
      {/* Bouton de réessai conditionnel */}
      {onRetry && (
        <button 
          className="btn btn-sm btn-outline-danger ms-2" // Bouton petit avec bordure rouge
          onClick={onRetry} // Déclenche la fonction onRetry au clic
        >
          Réessayer {/* Texte du bouton */}
        </button>
      )}
    </div>
  );
}

/**
 * GUIDE D'UTILISATION PAR TYPE D'ERREUR
 * 
 * Messages d'erreur recommandés selon le contexte :
 * 
 * 1. **Erreur réseau/API** :
 *    - "Impossible de charger les données"
 *    - "Échec de connexion au serveur"
 *    - "Le service est temporairement indisponible"
 * 
 * 2. **Erreur de validation** :
 *    - "Formulaire invalide, vérifiez les champs"
 *    - "Mot de passe incorrect"
 *    - "Email déjà utilisé"
 * 
 * 3. **Erreur d'autorisation** :
 *    - "Vous n'avez pas les permissions nécessaires"
 *    - "Session expirée, veuillez vous reconnecter"
 * 
 * 4. **Erreur inattendue** :
 *    - "Une erreur inattendue est survenue"
 *    - "Quelque chose s'est mal passé"
 */

/**
 * EXEMPLE DE CSS ATTENDU (Bootstrap)
 * 
 * .alert {
 *   position: relative;
 *   padding: 1rem;
 *   margin-bottom: 1rem;
 *   border: 1px solid transparent;
 *   border-radius: 0.25rem;
 * }
 * 
 * .alert-danger {
 *   color: #721c24;
 *   background-color: #f8d7da;
 *   border-color: #f5c6cb;
 * }
 * 
 * .d-flex { display: flex; }
 * .align-items-center { align-items: center; }
 * .flex-grow-1 { flex-grow: 1; }
 * 
 * .me-2 { margin-right: 0.5rem; }
 * .ms-2 { margin-left: 0.5rem; }
 * 
 * .btn-sm {
 *   padding: 0.25rem 0.5rem;
 *   font-size: 0.875rem;
 *   border-radius: 0.2rem;
 * }
 * 
 * .btn-outline-danger {
 *   color: #dc3545;
 *   border-color: #dc3545;
 * }
 */