import { useState } from 'react';
import { Search, Plus, Edit2, AlertTriangle, Package, ChevronDown, X, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ConfirmModal from '../components/ConfirmModal';
import useToast from '../hooks/useToast';
import useApiResource from '../hooks/useApiResource';
import useTableFilters from '../hooks/useTableFilters';
import { inventoryService } from '../services/api';
import './Inventory.css';

const CATEGORIES = ['Antibiotics', 'Analgesics', 'Antihypertensives', 'Vitamins', 'Antidiabetics', 'Antiseptics', 'IV Fluids', 'Equipment', 'Disposables', 'Other'];
const UNITS = ['Tablets', 'Capsules', 'Vials', 'Bottles', 'Sachets', 'Strips', 'Units', 'Boxes'];

const BLANK_ITEM = { name: '', category: '', unit: '', quantity: '', reorderLevel: '', rate: '', supplier: '', expiry: '' };

const STOCK_STATUS_META = {
  'in-stock':     { label: 'In Stock',     badgeStatus: 'confirmed' },
  'low-stock':    { label: 'Low Stock',    badgeStatus: 'pending' },
  'out-of-stock': { label: 'Out of Stock', badgeStatus: 'cancelled' },
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
  const isEdit = !!item?.itemId;
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
  const canManage = canEdit('inventory'); // admin and pharmacist both have full access
  const isAdmin = role === 'admin'; // deletion stays admin-only

  const { data: itemData, loading, error, refetch } = useApiResource(() => inventoryService.getAll());
  const items = itemData || [];

  const [modal, setModal] = useState(null);
  const { toast, showToast } = useToast();

  const lowStockCount = items.filter((i) => i.status === 'low-stock' || i.status === 'out-of-stock').length;

  const {
    filtered, search, setSearch, filterValues, setFilter, dateFrom, setDateFrom, dateTo, setDateTo, clearAll,
  } = useTableFilters(items, {
    searchFields: [(item) => item.name, (item) => item.supplier],
    filters: { category: (item) => item.category, status: (item) => item.status },
    dateField: (item) => item.expiry,
  });

  const handleSave = async (form) => {
    try {
      if (form.itemId) {
        await inventoryService.update(form.itemId, form);
        showToast('Item updated.');
      } else {
        await inventoryService.create(form);
        showToast('Item added to inventory.');
      }
      await refetch();
      setModal(null);
    } catch (err) {
      showToast(err.message || 'Failed to save item.');
    }
  };

  const handleDelete = async (item) => {
    try {
      await inventoryService.delete(item.itemId);
      await refetch();
      showToast(`${item.name} removed.`);
      setModal(null);
    } catch (err) {
      showToast(err.message || 'Failed to remove item.');
    }
  };

  if (loading) {
    return (
      <div className="inventory-page" aria-busy="true" aria-label="Loading…">
        {[1, 2, 3].map(n => (
          <div key={n} className="skeleton-row">
            <LoadingSkeleton variant="text" width="120px" />
            <LoadingSkeleton variant="text" width="200px" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-centered">
        <EmptyState icon={Package} message={error} actionLabel="Retry" onAction={refetch} />
      </div>
    );
  }

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
          <select value={filterValues.category} onChange={(e) => setFilter('category', e.target.value)} aria-label="Filter by category">
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <ChevronDown size={14} className="filter-icon" aria-hidden="true" />
          <select value={filterValues.status} onChange={(e) => setFilter('status', e.target.value)} aria-label="Filter by stock status">
            <option value="">All Statuses</option>
            <option value="in-stock">In Stock</option>
            <option value="low-stock">Low Stock</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>
        </div>
        <div className="filter-group date-range-group">
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} aria-label="Expiry from" title="Expiry from" />
          <span className="text-muted">to</span>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} aria-label="Expiry to" title="Expiry to" />
        </div>
      </div>

      <div className="table-container">
        {filtered.length === 0 ? (
          <EmptyState
            icon={Package}
            message="No inventory items match your search."
            actionLabel="Clear Filters"
            onAction={clearAll}
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
                    key={item.itemId}
                    className={item.status === 'out-of-stock' ? 'tr--danger' : item.status === 'low-stock' ? 'tr--warning' : ''}
                  >
                    <td><span className="item-id">{item.itemId}</span></td>
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
