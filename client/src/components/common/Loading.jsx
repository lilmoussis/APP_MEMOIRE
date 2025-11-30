/**
 * Composant Loading (Spinner de chargement)
 */

export default function Loading({ size = 'md', text = 'Chargement...' }) {
  const sizeClasses = {
    sm: 'spinner-border-sm',
    md: '',
    lg: 'spinner-border-lg'
  };
  
  return (
    <div className="spinner-wrapper">
      <div className="text-center">
        <div className={`spinner-border text-primary ${sizeClasses[size]}`} role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
        {text && <p className="mt-2 text-muted">{text}</p>}
      </div>
    </div>
  );
}
