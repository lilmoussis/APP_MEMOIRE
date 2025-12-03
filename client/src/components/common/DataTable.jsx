/**
 * Import des dépendances
 */
import { ChevronUp, ChevronDown } from 'lucide-react'; // Icônes pour l'indication de tri
import EmptyState from './EmptyState'; // Composant pour les états vides
import Loading from './Loading'; // Composant pour les états de chargement

/**
 * Composant DataTable - Tableau de données avancé avec tri et actions
 * Composant réutilisable pour afficher des données tabulaires avec fonctionnalités avancées
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {Array<Object>} props.columns - Configuration des colonnes
 * @param {Array<Object>} props.data - Données à afficher
 * @param {boolean} [props.isLoading=false] - État de chargement
 * @param {string} [props.emptyMessage='Aucune donnée disponible'] - Message quand pas de données
 * @param {Function} [props.onSort] - Callback pour le tri
 * @param {string} [props.sortColumn] - Colonne actuellement triée
 * @param {'asc'|'desc'} [props.sortDirection] - Direction du tri
 * @param {Function} [props.actions] - Fonction pour générer les boutons d'actions
 * 
 * @returns {JSX.Element} Tableau de données avec fonctionnalités
 * 
 * @example
 * // Exemple d'utilisation basique
 * <DataTable
 *   columns={[
 *     { key: 'name', label: 'Nom', sortable: true },
 *     { key: 'email', label: 'Email' },
 *     { key: 'role', label: 'Rôle' }
 *   ]}
 *   data={users}
 * />
 * 
 * @example
 * // Exemple avancé avec tri et actions
 * <DataTable
 *   columns={columns}
 *   data={data}
 *   onSort={handleSort}
 *   sortColumn={sortBy}
 *   sortDirection={sortOrder}
 *   isLoading={loading}
 *   actions={(row) => (
 *     <>
 *       <button onClick={() => editItem(row)}>Modifier</button>
 *       <button onClick={() => deleteItem(row)}>Supprimer</button>
 *     </>
 *   )}
 * />
 */
export default function DataTable({ 
  columns,                     // Configuration des colonnes (obligatoire)
  data,                       // Données à afficher (obligatoire)
  isLoading = false,          // État de chargement par défaut
  emptyMessage = 'Aucune donnée disponible', // Message vide par défaut
  onSort,                     // Callback pour le tri (optionnel)
  sortColumn,                 // Clé de la colonne triée (optionnel)
  sortDirection,              // Direction du tri (optionnel)
  actions                     // Fonction pour générer les actions (optionnel)
}) {
  /**
   * Gère le clic sur un en-tête de colonne pour le tri
   * Vérifie si la colonne est triable et appelle le callback onSort
   * 
   * @param {string} columnKey - Clé de la colonne cliquée
   */
  const handleSort = (columnKey) => {
    // Vérifie si onSort existe et si la colonne est marquée comme triable
    if (onSort && columns.find(col => col.key === columnKey)?.sortable) {
      onSort(columnKey); // Appelle la fonction de tri avec la clé de colonne
    }
  };

  // État de chargement - affiche le composant Loading
  if (isLoading) {
    return <Loading />;
  }

  // État vide - affiche le composant EmptyState
  if (!data || data.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  /**
   * Rendu du tableau de données
   */
  return (
    // Conteneur responsive pour les tableaux sur mobile
    <div className="table-responsive">
      {/* Table HTML avec classes Bootstrap */}
      <table className="table table-hover align-middle mb-0">
        {/* En-tête du tableau */}
        <thead className="table-light">
          <tr>
            {/* Mapping des colonnes configurées */}
            {columns.map((column) => (
              <th 
                key={column.key} // Clé unique pour React
                onClick={() => handleSort(column.key)} // Gestionnaire de clic pour le tri
                style={{ 
                  // Change le curseur uniquement pour les colonnes triables
                  cursor: column.sortable ? 'pointer' : 'default',
                  userSelect: 'none' // Empêche la sélection de texte
                }}
                // Classe CSS optionnelle pour la colonne
                className={column.className || ''}
              >
                {/* Contenu de l'en-tête avec icône de tri conditionnelle */}
                <div className="d-flex align-items-center gap-2">
                  <span>{column.label}</span>
                  {/* Affiche l'icône de tri si cette colonne est celle triée */}
                  {column.sortable && sortColumn === column.key && (
                    <span className="text-primary">
                      {sortDirection === 'asc' ? 
                        <ChevronUp size={14} /> : // Flèche vers le haut pour ascendant
                        <ChevronDown size={14} />} // Flèche vers le bas pour descendant
                    </span>
                  )}
                </div>
              </th>
            ))}
            
            {/* Colonne Actions optionnelle */}
            {actions && (
              <th 
                className="text-end" 
                style={{ width: '120px' }} // Largeur fixe pour la colonne actions
              >
                Actions
              </th>
            )}
          </tr>
        </thead>
        
        {/* Corps du tableau avec les données */}
        <tbody>
          {/* Mapping des lignes de données */}
          {data.map((row, index) => (
            <tr key={row.id || index}> {/* Utilise row.id si disponible, sinon l'index */}
              {/* Mapping des cellules pour chaque colonne */}
              {columns.map((column) => (
                <td 
                  key={column.key} 
                  className={column.className || ''} // Classe optionnelle pour la cellule
                >
                  {/* Contenu de la cellule avec render function personnalisée */}
                  {column.render 
                    ? column.render(row[column.key], row) // Fonction de rendu personnalisée
                    : row[column.key] || '-'} // Valeur directe ou tiret si vide
                </td>
              ))}
              
              {/* Cellule Actions optionnelle */}
              {actions && (
                <td className="text-end">
                  {/* Groupe de boutons pour les actions */}
                  <div className="btn-group btn-group-sm" role="group">
                    {/* Appelle la fonction actions avec la ligne courante */}
                    {actions(row)}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * STRUCTURE DES COLONNES
 * 
 * Exemple de configuration de colonnes :
 * 
 * const columns = [
 *   {
 *     key: 'id',           // Identifiant unique de la colonne
 *     label: 'ID',         // Libellé affiché dans l'en-tête
 *     sortable: true,      // La colonne peut être triée
 *     className: 'text-center', // Classe CSS optionnelle
 *     render: (value, row) => `#${value}` // Fonction de rendu personnalisée
 *   },
 *   {
 *     key: 'name',
 *     label: 'Nom',
 *     sortable: true
 *   },
 *   // ...
 * ];
 */

/**
 * EXEMPLE DE FONCTION ACTIONS
 * 
 * const actions = (row) => (
 *   <>
 *     <button 
 *       className="btn btn-outline-primary"
 *       onClick={() => handleEdit(row.id)}
 *     >
 *       Modifier
 *     </button>
 *     <button 
 *       className="btn btn-outline-danger"
 *       onClick={() => handleDelete(row.id)}
 *     >
 *       Supprimer
 *     </button>
 *   </>
 * );
 */