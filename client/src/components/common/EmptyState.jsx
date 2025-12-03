/**
 * Composant EmptyState (Affichage état vide)
 * Affiche un état visuel quand il n'y a pas de données à montrer
 * Utilisé dans les tableaux, listes, résultats de recherche vides, etc.
 * Améliore l'UX en évitant les espaces vides et en guidant l'utilisateur
 */

import { Inbox } from 'lucide-react'; // Icône par défaut (boîte de réception)

/**
 * Composant EmptyState
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {React.ComponentType} [props.icon=Inbox] - Composant icône à afficher
 * @param {string} [props.title='Aucune donnée'] - Titre principal de l'état vide
 * @param {string} [props.message='Aucun élément à afficher pour le moment'] - Message explicatif
 * @param {Function} [props.action=null] - Fonction à exécuter quand on clique sur le bouton d'action
 * @param {string} [props.actionLabel='Ajouter'] - Label du bouton d'action
 * 
 * @returns {JSX.Element} L'affichage de l'état vide
 * 
 * @example
 * // Utilisation simple
 * <EmptyState />
 * 
 * @example
 * // Personnalisation complète
 * <EmptyState
 *   icon={Search}
 *   title="Aucun résultat"
 *   message="Aucun utilisateur ne correspond à votre recherche"
 *   action={() => resetFilters()}
 *   actionLabel="Réinitialiser les filtres"
 * />
 * 
 * @example
 * // Avec une icône personnalisée
 * <EmptyState
 *   icon={() => <CustomIcon size={64} />}
 *   title="Panier vide"
 *   message="Ajoutez des articles à votre panier"
 *   action={() => navigate('/boutique')}
 *   actionLabel="Voir la boutique"
 * />
 */
export default function EmptyState({ 
  icon: Icon = Inbox, // Renommage de `icon` en `Icon` (convention pour les composants React)
  title = 'Aucune donnée', // Titre par défaut
  message = 'Aucun élément à afficher pour le moment', // Message par défaut
  action = null, // Action optionnelle (null par défaut)
  actionLabel = 'Ajouter' // Label du bouton par défaut
}) {
  /**
   * Rendu du composant EmptyState
   */
  return (
    // Conteneur principal centré
    <div className="text-center py-5">
      {/* Section icône avec marge basse */}
      <div className="mb-3">
        {/* 
          Icône avec :
          - Taille fixe de 64px
          - Couleur grise (text-muted) pour un look discret
        */}
        <Icon size={64} className="text-muted" />
      </div>

      {/* Titre en gris */}
      <h5 className="text-muted">{title}</h5>
      
      {/* Message explicatif en gris */}
      <p className="text-muted">{message}</p>

      {/* Bouton d'action conditionnel */}
      {action && (
        <button 
          className="btn btn-primary mt-3" // Bouton primaire avec marge haute
          onClick={action} // Déclenche la fonction action au clic
        >
          {actionLabel} {/* Texte du bouton */}
        </button>
      )}
    </div>
  );
}

/**
 * GUIDE DES ICÔNES RECOMMANDÉES
 * 
 * Selon le contexte, différentes icônes peuvent être utilisées :
 * 
 * 1. **Inbox** (par défaut) : Données manquantes, liste vide
 * 2. **Search** : Résultats de recherche vides
 * 3. **FileText** : Aucun document, rapport vide
 * 4. **Users** : Aucun utilisateur, équipe vide
 * 5. **Package** : Inventaire vide, produit manquant
 * 6. **CreditCard** : Aucune transaction, historique vide
 * 7. **MessageSquare** : Aucun message, chat vide
 * 8. **Calendar** : Aucun événement, calendrier vide
 */

/**
 * EXEMPLE DE CSS ATTENDU
 * 
 * .text-muted {
 *   color: #6c757d; /* Couleur grise pour texte secondaire *\/
 * }
 * 
 * .text-center {
 *   text-align: center;
 * }
 * 
 * .py-5 {
 *   padding-top: 3rem;
 *   padding-bottom: 3rem;
 * }
 * 
 * .mb-3 {
 *   margin-bottom: 1rem;
 * }
 * 
 * .mt-3 {
 *   margin-top: 1rem;
 * }
 */