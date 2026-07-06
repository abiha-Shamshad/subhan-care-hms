import { useState } from 'react';
import { Search, Plus, Edit2, AlertTriangle, Package, ChevronDown, X, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';
import useToast from '../hooks/useToast';
import './Inventory.css';

const CATEGORIES = ['Antibiotics', 'Analgesics', 'Antihypertensives', 'Vitamins', 'Antidiabetics', 'Antiseptics', 'IV Fluids', 'Equipment', 'Disposables', 'Other'];
const UNITS = ['Tablets', 'Capsules', 'Vials', 'Bottles', 'Sachets', 'Strips', 'Units', 'Boxes'];

const INITIAL_INVENTORY = [
  { id: 'MED-001', name: 'Paracetamol 500mg',   category: 'Analgesics',        unit: 'Tablets',  quantity: 450, reorderLevel: 100, rate: 2.5,  supplier: 'MediPak Ltd', expiry: '2027-12-31', status: 'in-stock' },
  { id: 'MED-002', name: 'Amoxicillin 500mg',   category: 'Antibiotics',       unit: 'Capsules', quantity: 80,  reorderLevel: 100, rate: 15,   supplier: 'PharmaCorp',  expiry: '2026-11-30', status: 'low-stock' },
  { id: 'MED-003', name: 'Atorvastatin 10mg',   category: 'Antihypertensives', unit: 'Tablets',  quantity: 200, reorderLevel: 50,  rate: 8,    supplier: 'GenMed',      expiry: '2027-06-30', status: 'in-stock' },
  { id: 'MED-004', name: 'Normal Saline 0.9%',  category: 'IV Fluids',         unit: 'Bottles',  quantity: 15,  reorderLevel: 30,  rate: 80,   supplier: 'IVPak',       expiry: '2027-03-31', status: 'low-stock' },
  { id: 'MED-005', name: 'Insulin Glargine',    category: 'Antidiabetics',     unit: 'Vials',    quantity: 0,   reorderLevel: 10,  rate: 450,  supplier: 'NovoNord',    expiry: '2026-09-30', status: 'out-of-stock' },
  { id: 'MED-006', name: 'Vitamin C 500mg',     category: 'Vitamins',          unit: 'Tablets',  quantity: 600, reorderLevel: 100, rate: 3,    supplier: 'VitaCare',    expiry: '2028-01-31', status: 'in-stock' },
];

const BLANK_ITEM = { name: '', category: '', unit: '', quantity: '', reorderLevel: '', rate: '', supplier: '', expiry: '' };

const STOCK_STATUS_META = {
  'in-stock':     { label: 'In Stock',     badgeStatus: 'confirmed' },
  'low-stock':    { label: 'Low Stock',    badgeStatus: 'pending' },
  'out-of-stock': { label: 'Out of Stock', badgeStatus: 'cancelled' },
};

const deriveStatus = (quantity, reorderLevel) => {
  if (quantity === 0) return 'out-of-stock';
  if (quantity <= reorderLevel) return 'low-stock';
  return 'in-stock';
};

const validateItem = (form) => {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Name is required';
  if (!form.category) errors.category = 'Category is required';
  if (!form.unit) errors.unit = 'Unit is required';
  if (form.quantity === '' || isNaN(Number(form.quantity))) errors.quantity = 'Valid quantity is required';
  if (form.reorderLevel === '' || isNaN(Number(form.reorderLevel))) errors.reorderLevel = 'Reorder level is required';
  return errors;
};

const InventoryModal = ({ item, onClose, onSave }) => {
  const isEdit = !!item?.id;
  const [form, setForm] = useState(isEdit ? { ...item } : { ...BLANK_ITEM });
  const [errors, setErrors] = useState({});
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validateItem(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave({
      ...form,
      quantity: Number(form.quantity),
      reorderLevel: Number(form.reorderLevel),
      rate: Number(form.rate) || 0,
    });
  };

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="inv-item-modal-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box">
        <div className="modal-header">
          <h2 id="inv-item-modal-title">{isEdit ? 'Edit Item' : 'Add Item'}</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>
        <form className="modal-form" onSubmit={handleSubmit} noValidate>
          <div className={`form-field ${errors.name ? 'has-error' : ''}`}>
            <label htmlFor="item-name">Name *</label>
            <input id="item-name" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Paracetamol 500mg" />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>
          <div className="form-row">
            <div className={`form-field ${errors.category ? 'has-error' : ''}`}>
              <label htmlFor="item-cat">Category *</label>
              <select id="item-cat" value={form.category} onChange={(e) => set('category', e.target.value)}>
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <span className="field-error">{errors.category}</span>}
            </div>
            <div className={`form-field ${errors.unit ? 'has-error' : ''}`}>
              <label htmlFor="item-unit">Unit *</label>
              <select id="item-unit" value={form.unit} onChange={(e) => set('unit', e.target.value)}>
                <option value="">Select unit</option>
                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
              {errors.unit && <span className="field-error">{errors.unit}</span>}
            </div>
          </div>
          <div className="form-row">
            <div className={`form-field ${errors.quantity ? 'has-error' : ''}`}>
              <label htmlFor="item-qty">Current Quantity *</label>
              <input id="item-qty" type="number" min={0} value={form.quantity} onChange={(e) => set('quantity', e.target.value)} placeholder="0" />
              {errors.quantity && <span className="field-error">{errors.quantity}</span>}
            </div>
            <div className={`form-field ${errors.reorderLevel ? 'has-error' : ''}`}>
              <label htmlFor="item-reorder">Reorder Level *</label>
              <input id="item-reorder" type="number" min={0} value={form.reorderLevel} onChange={(e) => set('reorderLevel', e.target.value)} placeholder="0" />
              {errors.reorderLevel && <span className="field-error">{errors.reorderLevel}</span>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="item-rate">Unit Rate (Rs.)</label>
              <input id="item-rate" type="number" min={0} value={form.rate} onChange={(e) => set('rate', e.target.value)} placeholder="0.00" />
            </div>
            <div className="form-field">
              <label htmlFor="item-expiry">Expiry Date</label>
              <input id="item-expiry" type="date" value={form.expiry} onChange={(e) => set('expiry', e.target.value)} />
            </div>
          </div>
          <div className="form-field">
            <label htmlFor="item-supplier">Supplier</label>
            <input id="item-supplier" value={form.supplier} onChange={(e) => set('supplier', e.target.value)} placeholder="Supplier name" />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{isEdit ? 'Save Changes' : 'Add Item'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Inventory = () => {
  const { role, canEdit } = useAuth();
  const isAdmin = canEdit('inventory');
  const isPharmacist = role === 'pharmacist';
  const canManage = isAdmin || isPharmacist;

  const [items, setItems] = useState(INITIAL_INVENTORY);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modal, setModal] = useState(null);
  const { toast, showToast } = useToast();

  const lowStockCount = items.filter((i) => i.status === 'low-stock' || i.status === 'out-of-stock').length;

  const filtered = items.filter((item) => {
    const q = search.toLowerCase();
    return (
      (item.name.toLowerCase().includes(q) || item.supplier.toLowerCase().includes(q)) &&
      (!filterCategory || item.category === filterCategory) &&
      (!filterStatus || item.status === filterStatus)
    );
  });

  const handleSave = (form) => {
    const status = deriveStatus(form.quantity, form.reorderLevel);
    if (form.id) {
      setItems((prev) => prev.map((i) => i.id === form.id ? { ...i, ...form, status } : i));
      showToast('Item updated.');
    } else {
      const id = `MED-${String(items.length + 1).padStart(3, '0')}`;
      setItems((prev) => [...prev, { ...form, id, status }]);
      showToast('Item added to inventory.');
    }
    setModal(null);
  };

  const handleDelete = (item) => {
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    showToast(`${item.name} removed.`);
    setModal(null);
  };

  return (
    <div className="inventory-page">
      {lowStockCount > 0 && (
        <div className="alert-banner alert-banner--warning">
          <AlertTriangle size={16} aria-hidden="true" />
          {lowStockCount} item{lowStockCount > 1 ? 's are' : ' is'} low on stock or out of stock — please reorder.
        </div>
      )}

      <div className="page-header">
        <div>
          <h2>Inventory Management</h2>
          <p className="page-subtitle">{items.length} items · {lowStockCount} need attention</p>
        </div>
        {canManage && (
          <button className="btn btn-primary" onClick={() => setModal({ type: 'add' })}>
            <Plus size={16} aria-hidden="true" /> Add Item
          </button>
        )}
      </div>

      <div className="table-controls">
        <div className="search-box">
          <Search size={16} aria-hidden="true" />
          <input
            type="search"
            placeholder="Search by name or supplier…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search inventory"
          />
        </div>
        <div className="filter-group">
          <ChevronDown size={14} className="filter-icon" aria-hidden="true" />
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} aria-label="Filter by category">
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <ChevronDown size={14} className="filter-icon" aria-hidden="true" />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} aria-label="Filter by stock status">
            <option value="">All Statuses</option>
            <option value="in-stock">In Stock</option>
            <option value="low-stock">Low Stock</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        {filtered.length === 0 ? (
          <EmptyState
            icon={Package}
            message="No inventory items match your search."
            actionLabel="Clear Filters"
            onAction={() => { setSearch(''); setFilterCategory(''); setFilterStatus(''); }}
          />
        ) : (
          <table className="data-table" aria-label="Inventory list">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Reorder At</th>
                <th>Unit Rate</th>
                <th>Expiry</th>
                <th>Status</th>
                {canManage && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const meta = STOCK_STATUS_META[item.status] || STOCK_STATUS_META['in-stock'];
                return (
                  <tr
                    key={item.id}
                    className={item.status === 'out-of-stock' ? 'tr--danger' : item.status === 'low-stock' ? 'tr--warning' : ''}
                  >
                    <td><span className="item-id">{item.id}</span></td>
                    <td>
                      <div className="cell-name">{item.name}</div>
                      <div className="text-muted">{item.supplier}</div>
                    </td>
                    <td className="text-secondary">{item.category}</td>
                    <td>
                      <span className={item.status !== 'in-stock' ? 'qty-alert' : ''}>
                        {item.quantity} {item.unit}
                      </span>
                    </td>
                    <td className="text-secondary">{item.reorderLevel}</td>
                    <td className="text-secondary">Rs. {item.rate}</td>
                    <td className="text-muted">{item.expiry || '—'}</td>
                    <td><StatusBadge status={meta.badgeStatus} label={meta.label} /></td>
                    {canManage && (
                      <td>
                        <div className="action-btns">
                          <button
                            className="icon-btn"
                            title="Edit item"
                            onClick={() => setModal({ type: 'edit', data: item })}
                            aria-label={`Edit ${item.name}`}
                          >
                            <Edit2 size={15} aria-hidden="true" />
                          </button>
                          {isAdmin && (
                            <button
                              className="icon-btn icon-btn--danger"
                              title="Remove item"
                              onClick={() => setModal({ type: 'delete', data: item })}
                              aria-label={`Remove ${item.name}`}
                            >
                              <Trash2 size={15} aria-hidden="true" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {modal?.type === 'add'    && <InventoryModal onClose={() => setModal(null)} onSave={handleSave} />}
      {modal?.type === 'edit'   && <InventoryModal item={modal.data} onClose={() => setModal(null)} onSave={handleSave} />}
      {modal?.type === 'delete' && (
        <ConfirmModal
          title="Remove Item"
          message={`Remove "${modal.data.name}" from inventory? This action cannot be undone.`}
          confirmLabel="Remove"
          variant="danger"
          onConfirm={() => handleDelete(modal.data)}
          onClose={() => setModal(null)}
        />
      )}

      {toast && <div className="toast toast--success" role="status">{toast}</div>}
    </div>
  );
};

export default Inventory;
