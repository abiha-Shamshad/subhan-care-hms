import { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { PATIENTS as STATIC_PATIENTS, SERVICE_CATALOG } from '../constants/billingData';

const BLANK_SERVICE = { name: '', qty: 1, rate: '' };

const validate = (form) => {
  const e = {};
  if (!form.patientId) e.patientId = 'Patient is required';
  if (!form.dueDate) e.dueDate = 'Due date is required';
  if (form.services.some(s => !s.name || !s.rate)) e.services = 'All service fields are required';
  return e;
};

const idFromDisplayString = (str) => str.match(/\(([^)]+)\)\s*$/)?.[1] || '';

/**
 * Create-invoice form, shared by Billing.jsx (live patients + optional
 * appointment-linked prefill) and BillingDashboard.jsx (falls back to the
 * static demo patient list when no `patients` prop is given).
 */
const InvoiceModal = ({ patients, initialValues, onClose, onSave }) => {
  const patientOptions = patients
    ? patients.map(p => ({ id: p.patientId, label: `${p.name} (${p.patientId})` }))
    : STATIC_PATIENTS.map(p => ({ id: idFromDisplayString(p), label: p }));

  const [form, setForm] = useState({
    patientId: initialValues?.patientId || '',
    appointmentId: initialValues?.appointmentId || null,
    date: initialValues?.date || new Date().toISOString().split('T')[0],
    dueDate: initialValues?.dueDate || '',
    services: initialValues?.services?.length ? initialValues.services : [{ ...BLANK_SERVICE }],
    discount: initialValues?.discount ?? '',
  });
  const [errors, setErrors] = useState({});

  const setSvc = (i, k, v) => setForm((f) => {
    const s = [...f.services];
    s[i] = { ...s[i], [k]: v };
    return { ...f, services: s };
  });
  const addSvc = () => setForm((f) => ({ ...f, services: [...f.services, { ...BLANK_SERVICE }] }));
  const removeSvc = (i) => setForm((f) => ({ ...f, services: f.services.filter((_, idx) => idx !== i) }));

  const sub = form.services.reduce((sum, s) => sum + (Number(s.qty) || 0) * (Number(s.rate) || 0), 0);
  const disc = Number(form.discount) || 0;
  const tot = sub - disc;

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const patientLabel = patientOptions.find(p => p.id === form.patientId)?.label || '';
    onSave({ ...form, patient: patientLabel, discount: disc, paid: 0, status: 'unpaid' });
  };

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="inv-modal-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box modal-box--lg">
        <div className="modal-header">
          <h2 id="inv-modal-title">Create Invoice</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close dialog">
            <X size={20} />
          </button>
        </div>
        <form className="modal-form" onSubmit={handleSubmit} noValidate>
          {form.appointmentId && (
            <div className="alert-banner alert-banner--info">
              Linked to appointment <strong>{form.appointmentId}</strong>
            </div>
          )}
          <div className="form-row">
            <div className={`form-field ${errors.patientId ? 'has-error' : ''}`}>
              <label htmlFor="inv-patient">Patient *</label>
              <select
                id="inv-patient"
                value={form.patientId}
                onChange={(e) => setForm((f) => ({ ...f, patientId: e.target.value }))}
              >
                <option value="">Select patient</option>
                {patientOptions.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
              {errors.patientId && <span className="field-error">{errors.patientId}</span>}
            </div>
            <div className={`form-field ${errors.dueDate ? 'has-error' : ''}`}>
              <label htmlFor="inv-due">Due Date *</label>
              <input
                id="inv-due"
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
              />
              {errors.dueDate && <span className="field-error">{errors.dueDate}</span>}
            </div>
          </div>

          <div className="billing-services-section">
            <div className="billing-services-header">
              <h3>Services</h3>
              <button type="button" className="btn btn-ghost btn-sm" onClick={addSvc}>
                <Plus size={14} aria-hidden="true" /> Add Service
              </button>
            </div>
            {errors.services && <span className="field-error">{errors.services}</span>}
            {form.services.map((svc, i) => (
              <div key={i} className="service-row">
                <div className="form-field svc-name-field">
                  <label htmlFor={`svc-name-${i}`}>Service</label>
                  <select
                    id={`svc-name-${i}`}
                    value={svc.name}
                    onChange={(e) => setSvc(i, 'name', e.target.value)}
                  >
                    <option value="">Select service</option>
                    {SERVICE_CATALOG.map(s => <option key={s} value={s}>{s}</option>)}
                    {svc.name && !SERVICE_CATALOG.includes(svc.name) && <option value={svc.name}>{svc.name}</option>}
                  </select>
                </div>
                <div className="form-field svc-qty-field">
                  <label htmlFor={`svc-qty-${i}`}>Qty</label>
                  <input
                    id={`svc-qty-${i}`}
                    type="number"
                    min={1}
                    value={svc.qty}
                    onChange={(e) => setSvc(i, 'qty', e.target.value)}
                  />
                </div>
                <div className="form-field svc-rate-field">
                  <label htmlFor={`svc-rate-${i}`}>Rate (Rs.)</label>
                  <input
                    id={`svc-rate-${i}`}
                    type="number"
                    min={0}
                    value={svc.rate}
                    onChange={(e) => setSvc(i, 'rate', e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="svc-amount">
                  <span className="form-field-label-spacer" aria-hidden="true"> </span>
                  <span>Rs. {((Number(svc.qty) || 0) * (Number(svc.rate) || 0)).toLocaleString()}</span>
                </div>
                {form.services.length > 1 && (
                  <button
                    type="button"
                    className="icon-btn icon-btn--danger svc-remove"
                    onClick={() => removeSvc(i)}
                    aria-label="Remove service"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
            <div className="invoice-totals">
              <div className="total-row">
                <span>Subtotal</span>
                <span>Rs. {sub.toLocaleString()}</span>
              </div>
              <div className="total-row">
                <label htmlFor="inv-disc">Discount (Rs.)</label>
                <input
                  id="inv-disc"
                  type="number"
                  min={0}
                  value={form.discount}
                  onChange={(e) => setForm((f) => ({ ...f, discount: e.target.value }))}
                  className="discount-input"
                />
              </div>
              <div className="total-row total-row--final">
                <span>Total</span>
                <span>Rs. {tot.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create Invoice</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceModal;
