/**
 * Composant Badge reutilisable
 */
export default function Badge({ children, variant = 'primary', size = 'md' }) {
  const sizeClass = size === 'sm' ? 'badge-sm' : '';
  
  return (
    <span className={`badge bg-${variant} ${sizeClass}`}>
      {children}
    </span>
  );
}
