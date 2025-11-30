/**
 * Composant ErrorMessage (Affichage d'erreurs)
 */

import { AlertCircle } from 'lucide-react';

export default function ErrorMessage({ 
  message = 'Une erreur est survenue', 
  onRetry = null,
  className = '' 
}) {
  return (
    <div className={`alert alert-danger d-flex align-items-center ${className}`} role="alert">
      <AlertCircle size={24} className="me-2" />
      <div className="flex-grow-1">
        {message}
      </div>
      {onRetry && (
        <button 
          className="btn btn-sm btn-outline-danger ms-2"
          onClick={onRetry}
        >
          Reessayer
        </button>
      )}
    </div>
  );
}
