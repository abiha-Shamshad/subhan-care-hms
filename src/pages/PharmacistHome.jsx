import { useState } from 'react';
import {
  Clock, CheckCircle2, AlertCircle, AlertTriangle,
  Pill, Package, ClipboardList, ChevronRight,
  X, RefreshCw, Search, ChevronDown,
  PackagePlus, CheckCheck,
} from 'lucide-react';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import useToast from '../hooks/useToast';
import { useNavigation } from '../context/NavigationContext';
import './PharmacistHome.css';

/* ── Mock data ─────────────────────────────────────── */
const INITIAL_RX = [
  {
    id: 'RX-4001', date: '03 Jul', time: '09:15',
    patient: { id: 'PT-1001', name: 'Ahmed Khan' },
    doctor: 'Dr. Fatima Noor', status: 'pending',
    items: [
      { name: 'Metformin 500mg', qty: 30, form: 'Tablet' },
      { name: 'Aspirin 75mg',    qty: 30, form: 'Tablet' },
    ],
  },
  {
    id: 'RX-4002', date: '03 Jul', time: '09:30',
    patient: { id: 'PT-1002', name: 'Sara Malik' },
    doctor: 'Dr. Usman Ali', status: 'pending',
    items: [{ name: 'Ibuprofen 400mg', qty: 20, form: 'Tablet' }],
  },
  {
    id: 'RX-4003', date: '03 Jul', time: '10:20',
    patient: { id: 'PT-1003', name: 'Hassan Raza' },
    doctor: 'Dr. Fatima Noor', status: 'dispensed',
    items: [{ name: 'Amoxicillin 500mg', qty: 21, form: 'Capsule' }],
  },
  {
    id: 'RX-4004', date: '03 Jul', time: '11:05',
    patient: { id: 'PT-1004', name: 'Maryam Iqbal' },
    doctor: 'Dr. Sana Riaz', status: 'pending',
    items: [
      { name: 'Omeprazole 20mg',  qty: 14, form: 'Capsule' },
      { name: 'Domperidone 10mg', qty: 30, form: 'Tablet'  },
    ],
  },
  {
    id: 'RX-4005', date: '02 Jul', time: '14:30',
    patient: { id: 'PT-1005', name: 'Zaid Hussain' },
    doctor: 'Dr. Usman Ali', status: 'pending',
    items: [{ name: 'Cetirizine 10mg', qty: 10, form: 'Tablet' }],
  },
  {
    id: 'RX-4006', date: '02 Jul', time: '15:00',
    patient: { id: 'PT-1006', name: 'Fatima Shah' },
    doctor: 'Dr. Fatima Noor', status: 'dispensed',
    items: [{ name: 'Paracetamol 500mg', qty: 20, form: 'Tablet' }],
  },
];

const INITIAL_STOCK_ALERTS = [
  { id: 'MED-001', name: 'Metformin 500mg',   category: 'Antidiabetic', form: 'Tablet',  stock: 12, threshold: 50,  level: 'critical' },
  { id: 'MED-002', name: 'Aspirin 75mg',       category: 'Antiplatelet', form: 'Tablet',  stock: 8,  threshold: 100, level: 'critical' },
  { id: 'MED-003', name: 'Amoxicillin 500mg',  category: 'Antibiotic',   form: 'Capsule', stock: 28, threshold: 50,  level: 'low'      },
  { id: 'MED-004', name: 'Omeprazole 20mg',    category: 'PPI',          form: 'Capsule', stock: 35, threshold: 60,  level: 'low'      },
];

const MEDICINE_OPTIONS = [
  'Amoxicillin 500mg', 'Aspirin 75mg',      'Atorvastatin 20mg',
  'Cetirizine 10mg',   'Ciprofloxacin 500mg', 'Domperidone 10mg',
  'Ibuprofen 400mg',   'Metformin 500mg',   'Metronidazole 400mg',
  'Omeprazole 20mg',   'Paracetamol 500mg', 'Salbutamol 100mcg',
  'Tramadol 50mg',     'Vitamin C 500mg',
];

/* ── Status / level config (icon + text — WCAG AA) ─ */
const RX_STATUS_CFG = {
  pending:   { label: 'Pending',   Icon: Clock,        cls: 'ph-badge--pending'   },
  dispensed: { label: 'Dispensed', Icon: CheckCircle2, cls: 'ph-badge--dispensed' },
};

const STOCK_LEVEL_CFG = {
  critical: { label: 'Critical',  Icon: AlertCircle,   cls: 'ph-level--critical' },
  low:      { label: 'Low Stock', Icon: AlertTriangle, cls: 'ph-level--low'      },
};

const getInitials = (name) =>
  name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

/* ── Update Stock Modal ──────────────────────────── */
const UpdateStockModal = ({ prefill, onClose, onSave }) => {
  const [medicine, setMedicine] = useState(prefill ?? '');
  const [qty,      setQty]      = useState('');
  const [notes,    setNotes]    = useState('');
  const [errors,   setErrors]   = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!medicine)           errs.medicine = 'Please select a medicine';
    if (!qty || Number(qty) <= 0) errs.qty = 'Enter a valid quantity';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave({ medicine, qty: Number(qty), notes });
  };

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="us-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box modal-box--sm">
        <div className="modal-header">
          <h2 id="us-title">Update Stock</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close dialog">
            <X size={20} />
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit} noValidate>
          <div className={`form-field ${errors.medicine ? 'has-error' : ''}`}>
            <label htmlFor="us-medicine">Medicine *</label>
            <select
              id="us-medicine"
              value={medicine}
              onChange={(e) => setMedicine(e.target.value)}
            >
              <option value="">Select medicine</option>
              {MEDICINE_OPTIONS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            {errors.medicine && <span className="field-error">{errors.medicine}</span>}
          </div>

          <div className={`form-field ${errors.qty ? 'has-error' : ''}`}>
            <label htmlFor="us-qty">Quantity to Add *</label>
            <input
              id="us-qty"
              type="number"
              min="1"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              placeholder="e.g. 100"
            />
            {errors.qty && <span className="field-error">{errors.qty}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="us-notes">Notes</label>
            <input
              id="us-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Supplier, batch number, expiry date…"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              <PackagePlus size={15} aria-hidden="true" /> Update Stock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── Dispense Confirm Modal ──────────────────────── */
const DispenseConfirmModal = ({ rx, onClose, onConfirm }) => (
  <div
    className="modal-overlay"
    role="dialog"
    aria-modal="true"
    aria-labelledby="dc-title"
    onClick={(e) => e.target === e.currentTarget && onClose()}
  >
    <div className="modal-box modal-box--sm">
      <div className="modal-header">
        <h2 id="dc-title">Confirm Dispense</h2>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close dialog">
          <X size={20} />
        </button>
      </div>

      <div className="ph-confirm-body">
        <p className="ph-confirm-info">
          Mark <strong>{rx.id}</strong> for <strong>{rx.patient.name}</strong> as dispensed?
        </p>

        <ul className="ph-confirm-items" aria-label="Items being dispensed">
          {rx.items.map((item, i) => (
            <li key={i} className="ph-confirm-item">
              <Pill size={13} aria-hidden="true" />
              <span className="ph-confirm-item-name">{item.name}</span>
              <span className="ph-confirm-qty">× {item.qty} {item.form}</span>
            </li>
          ))}
        </ul>

        <p className="ph-confirm-note">
          Prescribed by {rx.doctor} · {rx.date}. This cannot be undone.
        </p>
      </div>

      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={onConfirm}>
          <CheckCheck size={15} aria-hidden="true" /> Confirm Dispense
        </button>
      </div>
    </div>
  </div>
);

/* ── PharmacistHome ──────────────────────────────── */
const PharmacistHome = () => {
  const { navigate } = useNavigation();
  const { toast, showToast } = useToast();

  const [prescriptions, setPrescriptions] = useState(INITIAL_RX);
  const [stockAlerts,   setStockAlerts]   = useState(INITIAL_STOCK_ALERTS);
  const [viewState,     setViewState]     = useState('loaded');
  const [modal,         setModal]         = useState(null);
  const [search,        setSearch]        = useState('');
  const [filterStatus,  setFilterStatus]  = useState('');

  const loading = viewState === 'loading';
  const isEmpty = viewState === 'empty';
  const baseRx  = isEmpty ? [] : prescriptions;

  const filteredRx = baseRx.filter(rx => {
    const q = search.toLowerCase();
    const matchSearch = !q || rx.patient.name.toLowerCase().includes(q) || rx.id.toLowerCase().includes(q);
    const matchStatus = !filterStatus || rx.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const pendingCount   = prescriptions.filter(r => r.status === 'pending').length;
  const dispensedCount = prescriptions.filter(r => r.status === 'dispensed').length;
  const criticalCount  = stockAlerts.filter(s => s.level === 'critical').length;
  const lowCount       = stockAlerts.filter(s => s.level === 'low').length;
  const totalAlerts    = criticalCount + lowCount;

  const hasFilters = search || filterStatus;

  const handleDispense = (rx) => {
    setPrescriptions(prev =>
      prev.map(r => r.id === rx.id ? { ...r, status: 'dispensed' } : r)
    );
    showToast(`${rx.id} marked as dispensed for ${rx.patient.name}.`);
    setModal(null);
  };

  const handleUpdateStock = ({ medicine, qty }) => {
    setStockAlerts(prev =>
      prev
        .map(s => {
          if (s.name !== medicine) return s;
          const newStock = s.stock + qty;
          const ratio = newStock / s.threshold;
          const newLevel = ratio < 0.3 ? 'critical' : ratio < 1 ? 'low' : null;
          return { ...s, stock: newStock, level: newLevel };
        })
        .filter(s => s.level !== null)
    );
    showToast(`Stock updated for ${medicine}.`);
    setModal(null);
  };

  const handleRefresh = () => {
    setViewState('loading');
    setTimeout(() => setViewState('loaded'), 900);
  };

  const clearFilters = () => { setSearch(''); setFilterStatus(''); };

  return (
    <div className="pharmacist-home">

      {/* ── Topbar ────────────────────────────────────── */}
      <div className="ph-topbar" role="toolbar" aria-label="Dispensing queue controls">
        <div className="ph-topbar-info">
          <h2>Dispensing Queue</h2>
          <p className="page-subtitle">
            Thursday, 3 July 2026 · {prescriptions.length} prescriptions total
          </p>
        </div>

        <div className="ph-summary-chips" aria-label="Queue summary">
          <span className="ph-chip ph-chip--warning">
            <Clock size={12} aria-hidden="true" />
            {pendingCount} Pending
          </span>
          <span className="ph-chip ph-chip--success">
            <CheckCircle2 size={12} aria-hidden="true" />
            {dispensedCount} Dispensed
          </span>
          {criticalCount > 0 && (
            <span className="ph-chip ph-chip--danger" aria-label={`${criticalCount} critically low stock alert${criticalCount !== 1 ? 's' : ''}`}>
              <AlertCircle size={12} aria-hidden="true" />
              {criticalCount} Critical
            </span>
          )}
          {lowCount > 0 && (
            <span className="ph-chip ph-chip--amber">
              <AlertTriangle size={12} aria-hidden="true" />
              {lowCount} Low Stock
            </span>
          )}
        </div>

        <div className="ph-topbar-controls">
          <label htmlFor="ph-state" className="sr-only">Choose view state</label>
          <select
            id="ph-state"
            className="state-dropdown"
            value={viewState}
            onChange={(e) => setViewState(e.target.value)}
          >
            <option value="loaded">State: Real Data</option>
            <option value="loading">State: Loading</option>
            <option value="empty">State: Empty</option>
          </select>
          <button className="refresh-btn" onClick={handleRefresh} aria-label="Refresh dispensing queue">
            <RefreshCw size={15} aria-hidden="true" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ── Main grid ────────────────────────────────── */}
      <div className="ph-main-grid">

        {/* ── Left column ─────────────────────────────── */}
        <div className="ph-left-col">

          {/* Prescriptions card */}
          <div className="ph-section-card">
            <div className="ph-section-header">
              <div className="ph-section-title-row">
                <h3>
                  Prescriptions to Dispense
                  {!loading && (
                    <span className="ph-count-badge" aria-label={`${pendingCount} pending`}>
                      {pendingCount} pending
                    </span>
                  )}
                </h3>
              </div>
              <div className="ph-filter-row">
                <div className="search-box">
                  <Search size={15} aria-hidden="true" />
                  <input
                    type="search"
                    placeholder="Search patient or Rx ID…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label="Search prescriptions"
                  />
                </div>
                <div className="filter-group">
                  <ChevronDown size={13} className="filter-icon" aria-hidden="true" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    aria-label="Filter by status"
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="dispensed">Dispensed</option>
                  </select>
                </div>
                {hasFilters && (
                  <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
                    Clear
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              <div className="ph-skeleton-list" aria-busy="true" aria-label="Loading prescriptions">
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className="ph-skeleton-row">
                    <LoadingSkeleton variant="text" width="60px"  />
                    <LoadingSkeleton variant="text" width="130px" />
                    <LoadingSkeleton variant="text" width="150px" />
                    <LoadingSkeleton variant="text" width="90px"  />
                  </div>
                ))}
              </div>
            ) : filteredRx.length === 0 ? (
              <div className="ph-empty-wrap">
                <EmptyState
                  icon={ClipboardList}
                  message={hasFilters ? 'No prescriptions match your filters.' : 'No pending prescriptions.'}
                  actionLabel={hasFilters ? 'Clear Filters' : undefined}
                  onAction={hasFilters ? clearFilters : undefined}
                />
              </div>
            ) : (
              <div className="ph-table-scroll" role="region" aria-label="Prescriptions list">
                <table className="data-table" aria-label="Prescriptions to dispense">
                  <thead>
                    <tr>
                      <th scope="col">Rx / Date</th>
                      <th scope="col">Patient</th>
                      <th scope="col">Doctor</th>
                      <th scope="col">Items</th>
                      <th scope="col">Status</th>
                      <th scope="col">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRx.map(rx => {
                      const cfg = RX_STATUS_CFG[rx.status];
                      const StatusIcon = cfg.Icon;
                      return (
                        <tr
                          key={rx.id}
                          className={rx.status === 'dispensed' ? 'ph-row--dispensed' : ''}
                        >
                          <td>
                            <span className="cell-bold ph-rx-id">{rx.id}</span>
                            <span className="ph-rx-date text-muted">{rx.date} · {rx.time}</span>
                          </td>
                          <td>
                            <div className="ph-patient-cell">
                              <span className="ph-patient-avatar" aria-hidden="true">
                                {getInitials(rx.patient.name)}
                              </span>
                              <span className="cell-bold">{rx.patient.name}</span>
                            </div>
                          </td>
                          <td className="text-secondary">{rx.doctor}</td>
                          <td>
                            <div
                              className="ph-item-tags"
                              role="list"
                              aria-label={`${rx.items.length} item${rx.items.length !== 1 ? 's' : ''}`}
                            >
                              {rx.items.map((item, i) => (
                                <span key={i} className="ph-item-tag" role="listitem">
                                  {item.name} × {item.qty}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td>
                            <span
                              className={`ph-badge ${cfg.cls}`}
                              aria-label={`Status: ${cfg.label}`}
                            >
                              <StatusIcon size={11} aria-hidden="true" />
                              {cfg.label}
                            </span>
                          </td>
                          <td>
                            {rx.status === 'pending' && (
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => setModal({ type: 'dispense', rx })}
                                aria-label={`Dispense ${rx.id} for ${rx.patient.name}`}
                              >
                                <CheckCheck size={13} aria-hidden="true" /> Dispense
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && filteredRx.length > 0 && (
              <p className="ph-table-footer">
                Showing {filteredRx.length} of {baseRx.length} prescription{baseRx.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Low-Stock Alerts card */}
          <div className="ph-section-card">
            <div className="ph-section-header ph-section-header--compact">
              <h3>
                Low-Stock Alerts
                {!loading && stockAlerts.length > 0 && (
                  <span
                    className="ph-alert-count-badge"
                    aria-label={`${totalAlerts} stock alert${totalAlerts !== 1 ? 's' : ''}: ${criticalCount} critical, ${lowCount} low`}
                  >
                    {criticalCount > 0 && (
                      <span className="ph-dot ph-dot--critical" aria-hidden="true" />
                    )}
                    {totalAlerts} alert{totalAlerts !== 1 ? 's' : ''}
                  </span>
                )}
              </h3>
            </div>

            {loading ? (
              <div className="ph-skeleton-list" aria-busy="true" aria-label="Loading stock alerts">
                {[1, 2, 3].map(n => (
                  <div key={n} className="ph-skeleton-row">
                    <LoadingSkeleton variant="text" width="150px" />
                    <LoadingSkeleton variant="text" width="100px" />
                    <LoadingSkeleton variant="text" width="70px"  />
                  </div>
                ))}
              </div>
            ) : stockAlerts.length === 0 ? (
              <div className="ph-empty-wrap">
                <EmptyState
                  icon={Package}
                  message="All medicines are adequately stocked."
                />
              </div>
            ) : (
              <div
                className="ph-table-scroll"
                aria-live="polite"
                aria-label="Low-stock medicines"
                role="region"
              >
                <table className="data-table" aria-label="Low-stock medicines list">
                  <thead>
                    <tr>
                      <th scope="col">Medicine</th>
                      <th scope="col">Category</th>
                      <th scope="col">Form</th>
                      <th scope="col">In Stock</th>
                      <th scope="col">Threshold</th>
                      <th scope="col">Alert</th>
                      <th scope="col">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockAlerts.map(s => {
                      const lvl = STOCK_LEVEL_CFG[s.level];
                      const LvlIcon = lvl.Icon;
                      return (
                        <tr
                          key={s.id}
                          className={`ph-alert-row ph-alert-row--${s.level}`}
                          aria-label={`${s.name}: ${lvl.label} — ${s.stock} units remaining, threshold ${s.threshold}`}
                        >
                          <td className="cell-bold">{s.name}</td>
                          <td className="text-secondary">{s.category}</td>
                          <td className="text-secondary">{s.form}</td>
                          <td>
                            <span className={`ph-stock-value ph-stock-value--${s.level}`}>
                              {s.stock}
                            </span>
                          </td>
                          <td className="text-secondary">{s.threshold}</td>
                          <td>
                            <span
                              className={`ph-level-badge ${lvl.cls}`}
                              aria-label={`Alert level: ${lvl.label}`}
                            >
                              <LvlIcon size={11} aria-hidden="true" />
                              {lvl.label}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => setModal({ type: 'stock', prefill: s.name })}
                              aria-label={`Update stock for ${s.name}`}
                            >
                              <PackagePlus size={13} aria-hidden="true" /> Update
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ── Right panel ──────────────────────────────── */}
        <aside className="ph-side-panel" aria-label="Quick actions and stock summary">

          {/* Quick actions */}
          <div className="ph-panel-card">
            <div className="ph-panel-header">
              <h3>Quick Actions</h3>
            </div>
            <div className="ph-panel-body">
              <button
                className="ph-quick-btn ph-quick-btn--primary"
                onClick={() => setModal({ type: 'stock', prefill: '' })}
                aria-label="Open update stock form"
              >
                <div className="ph-quick-icon" aria-hidden="true">
                  <PackagePlus size={18} />
                </div>
                <div className="ph-quick-text">
                  <span className="ph-quick-label">Update Stock</span>
                  <span className="ph-quick-desc">Add inventory for any medicine</span>
                </div>
              </button>
            </div>
            <div className="ph-panel-links">
              <button className="ph-nav-link" onClick={() => navigate('prescriptions')}>
                <ClipboardList size={14} aria-hidden="true" />
                <span>All Prescriptions</span>
                <ChevronRight size={13} aria-hidden="true" />
              </button>
              <button className="ph-nav-link" onClick={() => navigate('inventory')}>
                <Package size={14} aria-hidden="true" />
                <span>Inventory</span>
                <ChevronRight size={13} aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Stock alert summary (only shown when alerts exist) */}
          {!loading && totalAlerts > 0 && (
            <div className="ph-panel-card ph-panel-card--alert">
              <div className="ph-panel-header">
                <AlertTriangle size={15} aria-hidden="true" className="ph-panel-alert-icon" />
                <h3>Stock Alert Summary</h3>
              </div>
              <div className="ph-alert-summary">
                {criticalCount > 0 && (
                  <div
                    className="ph-alert-summary-row ph-alert-summary-row--critical"
                    aria-label={`${criticalCount} medicine${criticalCount !== 1 ? 's' : ''} critically low`}
                  >
                    <AlertCircle size={14} aria-hidden="true" />
                    <span>
                      {criticalCount} medicine{criticalCount !== 1 ? 's' : ''} critically low
                    </span>
                  </div>
                )}
                {lowCount > 0 && (
                  <div
                    className="ph-alert-summary-row ph-alert-summary-row--low"
                    aria-label={`${lowCount} medicine${lowCount !== 1 ? 's' : ''} running low`}
                  >
                    <AlertTriangle size={14} aria-hidden="true" />
                    <span>
                      {lowCount} medicine{lowCount !== 1 ? 's' : ''} running low
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

        </aside>
      </div>

      {/* ── Modals ────────────────────────────────────── */}
      {modal?.type === 'stock' && (
        <UpdateStockModal
          prefill={modal.prefill}
          onClose={() => setModal(null)}
          onSave={handleUpdateStock}
        />
      )}
      {modal?.type === 'dispense' && (
        <DispenseConfirmModal
          rx={modal.rx}
          onClose={() => setModal(null)}
          onConfirm={() => handleDispense(modal.rx)}
        />
      )}

      {toast && <div className="toast toast--success" role="status">{toast}</div>}
    </div>
  );
};

export default PharmacistHome;
