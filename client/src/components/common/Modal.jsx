import { X } from 'lucide-react';
import { useEffect } from 'react';

/**
 * Composant Modal reutilisable
 */
export default function Modal({ isOpen, onClose, title, children, size = 'md', footer }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'modal-sm',
    md: 'modal-md',
    lg: 'modal-lg',
    xl: 'modal-xl'
  };

  return (
    <>
      <div className="modal-backdrop-modern" onClick={onClose}></div>
      <div className="modal-modern show">
        <div className={`modal-dialog-modern ${sizeClasses[size]}`}>
          <div className="modal-content-modern">
            <div className="modal-header-modern">
              <div className="modal-header-content">
                <h5 className="modal-title-modern">{title}</h5>
                <button 
                  type="button" 
                  className="modal-close-btn"
                  onClick={onClose}
                  aria-label="Close"
                >
                  <X size={20} strokeWidth={2} />
                </button>
              </div>
            </div>
            <div className="modal-body-modern">
              {children}
            </div>
            {footer && (
              <div className="modal-footer-modern">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
