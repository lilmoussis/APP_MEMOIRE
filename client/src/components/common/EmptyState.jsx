/**
 * Composant EmptyState (Affichage etat vide)
 */

import { Inbox } from 'lucide-react';

export default function EmptyState({ 
  icon: Icon = Inbox,
  title = 'Aucune donnee',
  message = 'Aucun element a afficher pour le moment',
  action = null,
  actionLabel = 'Ajouter'
}) {
  return (
    <div className="text-center py-5">
      <div className="mb-3">
        <Icon size={64} className="text-muted" />
      </div>
      <h5 className="text-muted">{title}</h5>
      <p className="text-muted">{message}</p>
      {action && (
        <button className="btn btn-primary mt-3" onClick={action}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
