import { useState } from 'react';
import { X } from 'lucide-react';
import { PAYMENT_METHODS, outstandingOf } from '../constants/billingData';

const PaymentModal = ({ invoice, onClose, onRecord }) => {
  const owed = outstandingOf(invoice);
  const [amount, setAmount] = useState(owed);
  const [method, setMethod] = useState('Cash');
  const [ref, setRef] = useState('');

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pay-modal-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box modal-box--sm">
        <div className="modal-header">
          <h2 id="pay-modal-title">Record Payment — {invoice.id}</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close dialog">
            <X size={20} />
          </button>
        </div>
        <div className="modal-form">
          <div className="form-field">
            <label htmlFor="pay-amount">Amount Received (Rs.) *</label>
            <input
              id="pay-amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              max={owed}
            />
            <span className="field-hint">Outstanding: Rs. {owed.toLocaleString()}</span>
          </div>
          <div className="form-field">
            <label htmlFor="pay-method">Payment Method *</label>
            <select id="pay-method" value={method} onChange={(e) => setMethod(e.target.value)}>
              {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="pay-ref">Reference / Receipt No.</label>
            <input
              id="pay-ref"
              value={ref}
              onChange={(e) => setRef(e.target.value)}
              placeholder="Optional"
            />
          </div>
          <div className="modal-actions modal-actions--borderless">
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button
              className="btn btn-secondary"
              onClick={() => onRecord(Number(amount), method, ref)}
            >
              Record Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
