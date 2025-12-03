/**
 * Import des dépendances
 */
import { AlertTriangle } from 'lucide-react'; // Icône d'alerte/triangle d'avertissement
import Modal from './Modal'; // Composant Modal réutilisable

/**
 * Composant ConfirmDialog (Boîte de dialogue de confirmation)
 * Affiche une modale de confirmation avec options Oui/Non
 * Utilisé pour confirmer des actions critiques (suppression, modifications importantes, etc.)
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {boolean} props.isOpen - Contrôle l'ouverture/fermeture de la modale
 * @param {Function} props.onClose - Fonction appelée quand on ferme ou annule
 * @param {Function} props.onConfirm - Fonction appelée quand l'utilisateur confirme
 * @param {string} [props.title='Confirmation'] - Titre de la modale
 * @param {string} [props.message='Êtes-vous sûr de vouloir continuer ?'] - Message de confirmation
 * @param {string} [props.confirmText='Confirmer'] - Texte du bouton de confirmation
 * @param {string} [props.cancelText='Annuler'] - Texte du bouton d'annulation
 * @param {string} [props.variant='danger'] - Variante de couleur pour l'icône et le bouton ('danger', 'warning', 'primary', etc.)
 * @param {boolean} [props.isLoading=false] - État de chargement (désactive les boutons et affiche un spinner)
 * 
 * @returns {JSX.Element|null} La modale de confirmation ou null si non ouverte
 * 
 * @example
 * // Utilisation de base
 * <ConfirmDialog
 *   isOpen={showConfirm}
 *   onClose={() => setShowConfirm(false)}
 *   onConfirm={handleDelete}
 *   message="Voulez-vous vraiment supprimer cet élément ?"
 * />
 * 
 * @example
 * // Avec personnalisation
 * <ConfirmDialog
 *   isOpen={showConfirm}
 *   onClose={closeDialog}
 *   onConfirm={confirmAction}
 *   title="Attention !"
 *   message="Cette action est irréversible. Continuer ?"
 *   confirmText="Supprimer"
 *   cancelText="Garder"
 *   variant="danger"
 *   isLoading={deleting}
 * />
 */
export default function ConfirmDialog({ 
  isOpen,           // Contrôle l'état ouvert/fermé de la modale (obligatoire)
  onClose,          // Fonction de fermeture (obligatoire)
  onConfirm,        // Fonction de confirmation (obligatoire)
  title = 'Confirmation',                     // Titre par défaut
  message = 'Êtes-vous sûr de vouloir continuer ?', // Message par défaut
  confirmText = 'Confirmer',                  // Texte bouton confirmation par défaut
  cancelText = 'Annuler',                     // Texte bouton annulation par défaut
  variant = 'danger',                         // Variante par défaut (pour actions dangereuses)
  isLoading = false                           // État de chargement par défaut
}) {
  /**
   * Gère le clic sur le bouton de confirmation
   * Appelle la fonction onConfirm passée en props
   */
  const handleConfirm = () => {
    onConfirm(); // Exécute l'action de confirmation
  };

  /**
   * Contenu du footer (pied) de la modale
   * Contient les boutons Annuler et Confirmer
   */
  const footer = (
    <>
      {/* Bouton Annuler */}
      <button 
        type="button" 
        className="btn btn-secondary"  // Style secondaire (gris)
        onClick={onClose}              // Ferme la modale sans action
        disabled={isLoading}           // Désactivé pendant le chargement
      >
        {cancelText} {/* Texte personnalisable */}
      </button>
      
      {/* Bouton Confirmer */}
      <button 
        type="button" 
        className={`btn btn-${variant}`} // Style basé sur la variante (danger, warning, etc.)
        onClick={handleConfirm}          // Déclenche l'action de confirmation
        disabled={isLoading}             // Désactivé pendant le chargement
      >
        {/* Affiche un spinner si en chargement, sinon le texte normal */}
        {isLoading ? (
          <>
            {/* Spinner d'indication de chargement */}
            <span 
              className="spinner-border spinner-border-sm me-2" 
              role="status" 
              aria-hidden="true"
            ></span>
            Traitement... {/* Texte pendant le chargement */}
          </>
        ) : confirmText /* Texte normal du bouton */}
      </button>
    </>
  );

  /**
   * Rendu de la modale de confirmation
   * Utilise le composant Modal générique avec des props spécifiques
   */
  return (
    <Modal 
      isOpen={isOpen}     // Passe l'état ouvert/fermé au Modal
      onClose={onClose}   // Passe la fonction de fermeture
      title={title}       // Passe le titre personnalisé
      size="sm"           // Taille petite (sm) pour les confirmations
      footer={footer}     // Passe le contenu du footer défini ci-dessus
    >
      {/* Contenu principal de la modale */}
      <div className="text-center py-3">
        {/* Icône d'alerte centrée avec couleur basée sur la variante */}
        <AlertTriangle 
          size={48}                       // Grande taille pour visibilité
          className={`text-${variant} mb-3`} // Couleur dynamique + marge basse
        />
        
        {/* Message de confirmation centré */}
        <p className="mb-0">{message}</p>
      </div>
    </Modal>
  );
}

/**
 * GUIDE DES VARIANTS
 * 
 * Variantes typiques et leurs usages :
 * 
 * 1. **danger** (par défaut) : Actions critiques (suppression, désactivation permanente)
 * 2. **warning** : Actions réversibles mais importantes (modifications majeures)
 * 3. **primary** : Actions standard nécessitant une confirmation
 * 4. **success** : Actions positives (publication, activation)
 * 
 * Note: Les classes CSS `text-${variant}` et `btn-${variant}` doivent exister
 */

/**
 * EXEMPLE DE CSS ATTENDU
 * 
 * .btn-danger {
 *   background-color: #dc3545;
 *   color: white;
 * }
 * 
 * .btn-warning {
 *   background-color: #ffc107;
 *   color: #212529;
 * }
 * 
 * .text-danger { color: #dc3545; }
 * .text-warning { color: #ffc107; }
 * 
 * .spinner-border {
 *   animation: spinner-border 0.75s linear infinite;
 * }
 */