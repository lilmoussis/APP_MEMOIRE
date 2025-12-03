/**
 * Import des dépendances
 */
import { Search, X } from 'lucide-react'; // Icônes de recherche et de fermeture
import { useState } from 'react'; // Hook React pour l'état local

/**
 * Barre de recherche réutilisable avec debounce
 * Optimise les performances en évitant les appels API trop fréquents
 */

/**
 * @param {Object} props - Propriétés du composant
 * @param {Function} props.onSearch - Fonction appelée avec le terme de recherche
 * @param {string} [props.placeholder='Rechercher...'] - Texte d'aide dans l'input
 * @param {number} [props.debounce=500] - Délai en ms avant d'appeler onSearch
 */
export default function SearchBar({ 
  onSearch,              // Fonction de callback pour la recherche
  placeholder = 'Rechercher...', // Placeholder par défaut
  debounce = 500         // Délai de debounce par défaut: 500ms
}) {
  // État pour la valeur actuelle de l'input
  const [searchTerm, setSearchTerm] = useState('');
  
  // État pour stocker l'ID du timeout (pour le debounce)
  const [timeoutId, setTimeoutId] = useState(null);

  /**
   * Gère le changement dans l'input
   * Met à jour l'état et programme l'appel à onSearch avec debounce
   */
  const handleChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value); // Met à jour l'état local immédiatement

    // Annule le timeout précédent s'il existe
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Crée un nouveau timeout pour appeler onSearch après le délai
    const newTimeoutId = setTimeout(() => {
      onSearch(value); // Appelle la fonction de recherche
    }, debounce);

    setTimeoutId(newTimeoutId); // Stocke l'ID du timeout
  };

  /**
   * Vide le champ de recherche et annule les recherches en attente
   */
  const handleClear = () => {
    setSearchTerm(''); // Réinitialise l'input
    onSearch(''); // Appelle la recherche avec une chaîne vide
    
    // Annule le timeout s'il existe
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };

  return (
    // Conteneur avec position relative pour le positionnement
    <div className="position-relative">
      {/* Groupe d'input Bootstrap */}
      <div className="input-group">
        {/* Icône de recherche à gauche */}
        <span className="input-group-text bg-white">
          <Search size={18} className="text-muted" />
        </span>
        
        {/* Champ de saisie principal */}
        <input
          type="text"
          className="form-control border-start-0" // Supprime la bordure gauche
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleChange} // Gère les changements de texte
        />
        
        {/* Bouton de suppression conditionnel (affiche seulement si texte présent) */}
        {searchTerm && (
          <button 
            className="btn btn-outline-secondary" 
            type="button"
            onClick={handleClear} // Vide le champ au clic
          >
            <X size={18} /> {/* Icône de fermeture */}
          </button>
        )}
      </div>
    </div>
  );
}