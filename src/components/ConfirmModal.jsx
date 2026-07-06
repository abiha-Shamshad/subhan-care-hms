import { X } from 'lucide-react';

const ConfirmModal = ({
  title = 'Confirm Action',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onClose,
}) => (
  <div
    className="modal-overlay"
    role="dialog"
    aria-modal="true"
    aria-labelledby="confirm-modal-title"
    onClick={(e) => e.target === e.currentTarget && onClose()}
  >
    <div className="modal-box modal-box--sm">
      <div className="modal-header">
        <h2 id="confirm-modal-title">{title}</h2>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close dialog">
          <X size={20} />
        </button>
      </div>
      <p className="modal-confirm-text">{message}</p>
      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onClose}>{cancelLabel}</button>
        <button className={`btn btn-${variant}`} onClick={onConfirm}>{confirmLabel}</button>
      </div>
    </div>
  </div>
);

export default ConfirmModal;
