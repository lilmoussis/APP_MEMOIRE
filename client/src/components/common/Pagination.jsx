/**
 * Composant Pagination
 * Affiche une navigation pour paginer des données
 * Montre les numéros de page avec élision (...) pour les longues séries
 */

export default function Pagination({ 
  currentPage,     // Page actuelle (commence à 1)
  totalPages,      // Nombre total de pages
  onPageChange,    // Fonction appelée quand la page change
  className = ''   // Classes CSS additionnelles
}) {
  // Si une seule page ou moins, ne rien afficher
  if (totalPages <= 1) return null;
  
  // Tableau pour stocker les numéros de page à afficher
  const pages = [];
  
  // Nombre maximum de boutons de page à afficher (sans les flèches et "...")
  const maxPagesToShow = 5;
  
  // Calcul de l'intervalle de pages à afficher
  // Centre la page courante autant que possible
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
  
  // Ajuste le début si on n'a pas assez de pages à la fin
  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }
  
  // Remplit le tableau avec les numéros de page à afficher
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  
  return (
    // Conteneur principal avec classes optionnelles
    <nav className={className}>
      {/* Liste Bootstrap pour la pagination */}
      <ul className="pagination justify-content-center mb-0">
        
        {/* Bouton "Précédent" */}
        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
          <button 
            className="page-link"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Précédent
          </button>
        </li>
        
        {/* Affichage de la première page avec élision si nécessaire */}
        {startPage > 1 && (
          <>
            {/* Bouton pour la première page (1) */}
            <li className="page-item">
              <button className="page-link" onClick={() => onPageChange(1)}>
                1
              </button>
            </li>
            {/* Points de suspension si écart entre 1 et startPage */}
            {startPage > 2 && (
              <li className="page-item disabled">
                <span className="page-link">...</span>
              </li>
            )}
          </>
        )}
        
        {/* Boucle sur les pages à afficher (le bloc principal) */}
        {pages.map(page => (
          <li 
            key={page}
            className={`page-item ${currentPage === page ? 'active' : ''}`}
          >
            <button 
              className="page-link"
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          </li>
        ))}
        
        {/* Affichage de la dernière page avec élision si nécessaire */}
        {endPage < totalPages && (
          <>
            {/* Points de suspension si écart entre endPage et totalPages */}
            {endPage < totalPages - 1 && (
              <li className="page-item disabled">
                <span className="page-link">...</span>
              </li>
            )}
            {/* Bouton pour la dernière page */}
            <li className="page-item">
              <button className="page-link" onClick={() => onPageChange(totalPages)}>
                {totalPages}
              </button>
            </li>
          </>
        )}
        
        {/* Bouton "Suivant" */}
        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
          <button 
            className="page-link"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Suivant
          </button>
        </li>
      </ul>
    </nav>
  );
}