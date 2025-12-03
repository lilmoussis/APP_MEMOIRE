/**
 * Composant Badge réutilisable
 * Affiche un badge avec différents styles et tailles
 * Utilisé pour montrer des états, catégories, statuts, etc.
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {React.ReactNode} props.children - Contenu du badge (texte, icône, etc.)
 * @param {string} [props.variant='primary'] - Variante de couleur du badge
 * @param {string} [props.size='md'] - Taille du badge ('sm' pour small, 'md' pour medium)
 * 
 * @returns {JSX.Element} Un élément span stylisé comme badge
 * 
 * @example
 * // Badge primaire par défaut
 * <Badge>Nouveau</Badge>
 * 
 * // Badge avec variante de couleur
 * <Badge variant="success">Actif</Badge>
 * 
 * // Petit badge
 * <Badge size="sm" variant="warning">En attente</Badge>
 * 
 * // Badge avec icône
 * <Badge variant="danger">
 *   <AlertCircle size={12} /> Erreur
 * </Badge>
 */
export default function Badge({ 
  children,           // Contenu à afficher dans le badge (obligatoire)
  variant = 'primary', // Variante de couleur (par défaut: 'primary')
  size = 'md'         // Taille du badge (par défaut: 'md' - medium)
}) {
  /**
   * Détermine la classe CSS pour la taille
   * Si size est 'sm', ajoute 'badge-sm', sinon chaîne vide
   */
  const sizeClass = size === 'sm' ? 'badge-sm' : '';
  
  /**
   * Rendu du badge
   * Classes CSS :
   * - `badge` : classe de base pour tous les badges
   * - `bg-${variant}` : classe pour la couleur de fond (ex: bg-primary, bg-success)
   * - `${sizeClass}` : classe optionnelle pour la taille (badge-sm ou '')
   */
  return (
    <span className={`badge bg-${variant} ${sizeClass}`}>
      {children}
    </span>
  );
}

/**
 * GUIDE D'UTILISATION DES VARIANTS
 * 
 * Variantes typiquement disponibles dans les systèmes de design :
 * 
 * 1. **primary**   : Bleu, pour les actions principales
 * 2. **secondary** : Gris, pour les éléments secondaires
 * 3. **success**   : Vert, pour les états positifs/validés
 * 4. **danger**    : Rouge, pour les erreurs/alertes
 * 5. **warning**   : Orange/jaune, pour les avertissements
 * 6. **info**      : Cyan/bleu clair, pour les informations
 * 7. **light**     : Blanc/gris clair, sur fond sombre
 * 8. **dark**      : Noir/gris foncé, sur fond clair
 */

/**
 * EXEMPLE DE CSS ATTENDU
 * 
 * .badge {
 *   display: inline-flex;
 *   align-items: center;
 *   padding: 0.25rem 0.5rem;
 *   border-radius: 0.25rem;
 *   font-size: 0.875rem;
 *   font-weight: 500;
 *   line-height: 1;
 *   white-space: nowrap;
 * }
 * 
 * .badge-sm {
 *   padding: 0.125rem 0.375rem;
 *   font-size: 0.75rem;
 * }
 * 
 * .bg-primary { background-color: #007bff; color: white; }
 * .bg-success { background-color: #28a745; color: white; }
 * .bg-danger  { background-color: #dc3545; color: white; }
 * .bg-warning { background-color: #ffc107; color: #212529; }
 * // etc.
 */