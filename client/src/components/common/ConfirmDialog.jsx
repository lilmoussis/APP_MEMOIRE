import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

/**
 * Boite de dialogue de confirmation
 */
export default function ConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirmation', 
  message = 'Etes-vous sur de vouloir continuer ?',
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  variant = 'danger',
  isLoading = false
}) {
  const handleConfirm = () => {
    onConfirm();
  };

  const footer = (
    <>
      <button 
        type="button" 
        className="btn btn-secondary" 
        onClick={onClose}
        disabled={isLoading}
      >
        {cancelText}
      </button>
      <button 
        type="button" 
        className={`btn btn-${variant}`}
        onClick={handleConfirm}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Traitement...
          </>
        ) : confirmText}
      </button>
    </>
  );

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={title}
      size="sm"
      footer={footer}
    >
      <div className="text-center py-3">
        <AlertTriangle size={48} className={`text-${variant} mb-3`} />
        <p className="mb-0">{message}</p>
      </div>
    </Modal>
  );
}
