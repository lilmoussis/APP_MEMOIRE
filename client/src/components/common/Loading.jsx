/**
 * Composant Loading (Spinner de chargement)
 * Affiche un indicateur visuel pendant les opérations asynchrones
 */

export default function Loading({ 
  size = 'md',        // Taille du spinner: 'sm' (petit), 'md' (moyen), 'lg' (grand)
  text = 'Chargement...' // Texte optionnel à afficher sous le spinner
}) {
  /**
   * Mappage des tailles vers les classes CSS Bootstrap correspondantes
   */
  const sizeClasses = {
    sm: 'spinner-border-sm',  // Classe pour petit spinner
    md: '',                    // Pas de classe supplémentaire pour taille moyenne
    lg: 'spinner-border-lg'   // Classe pour grand spinner
  };
  
  return (
    // Conteneur principal pour le spinner
    <div className="spinner-wrapper">
      {/* Conteneur centré pour l'alignement */}
      <div className="text-center">
        {/* 
          Spinner Bootstrap avec :
          - Classe de base 'spinner-border' pour l'animation
          - Couleur primaire 'text-primary'
          - Classe de taille conditionnelle basée sur la prop `size`
          - Attribut ARIA pour l'accessibilité
        */}
        <div 
          className={`spinner-border text-primary ${sizeClasses[size]}`} 
          role="status"
        >
          {/* Texte masqué visuellement mais accessible aux lecteurs d'écran */}
          <span className="visually-hidden">Chargement...</span>
        </div>
        
        {/* Affiche le texte optionnel seulement si la prop `text` est fournie */}
        {text && (
          <p className="mt-2 text-muted">{text}</p> // Marge haute et couleur grise
        )}
      </div>
    </div>
  );
}