import { X, Mail, Phone, Clock } from 'lucide-react';
import './HelpSupportModal.css';

const HelpSupportModal = ({ onClose }) => (
  <div
    className="modal-overlay"
    role="dialog"
    aria-modal="true"
    aria-labelledby="help-support-title"
    onClick={(e) => e.target === e.currentTarget && onClose()}
  >
    <div className="modal-box modal-box--sm">
      <div className="modal-header">
        <h2 id="help-support-title">Help &amp; Support</h2>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close dialog">
          <X size={20} />
        </button>
      </div>
      <p className="modal-confirm-text">Need a hand? Reach out through any of the channels below.</p>

      <div className="hs-row">
        <Mail size={16} className="hs-row-icon" aria-hidden="true" />
        <div>
          <span className="text-secondary">Email</span>
          <div className="cell-bold">support@subhancare.pk</div>
        </div>
      </div>
      <div className="hs-row">
        <Phone size={16} className="hs-row-icon" aria-hidden="true" />
        <div>
          <span className="text-secondary">Phone</span>
          <div className="cell-bold">+92 21 111 222 333</div>
        </div>
      </div>
      <div className="hs-row">
        <Clock size={16} className="hs-row-icon" aria-hidden="true" />
        <div>
          <span className="text-secondary">Hours</span>
          <div className="cell-bold">Mon–Fri, 9:00 AM – 6:00 PM</div>
        </div>
      </div>

      <div className="modal-actions">
        <button className="btn btn-primary" onClick={onClose}>Close</button>
      </div>
    </div>
  </div>
);

export default HelpSupportModal;
