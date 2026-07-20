import { useState } from 'react';
import { Search, Plus, Edit2, UserX, UserCheck, ChevronDown, UserCog, KeyRound, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';
import useToast from '../hooks/useToast';
import './Staff.css';

const ROLE_OPTIONS = ['admin', 'doctor', 'receptionist', 'pharmacist', 'billing'];
const DEPARTMENTS = ['Administration', 'Emergency', 'Cardiology', 'Orthopedics', 'Pediatrics', 'Pharmacy', 'Billing', 'HR', 'IT'];

const INITIAL_STAFF = [
  { id: 'ST-001', name: 'Ahmed Siddiqui', role: 'admin', department: 'Administration', email: 'ahmed.s@subhancare.pk', phone: '0300-0011223', status: 'active', lastLogin: '2026-07-03 08:14' },
  { id: 'ST-002', name: 'Dr. Fatima Noor', role: 'doctor', department: 'Cardiology', email: 'fatima.noor@subhancare.pk', phone: '0300-1112233', status: 'active', lastLogin: '2026-07-03 07:50' },
  { id: 'ST-003', name: 'Zara Shah', role: 'receptionist', department: 'Emergency', email: 'zara.shah@subhancare.pk', phone: '0321-5544332', status: 'active', lastLogin: '2026-07-03 09:00' },
  { id: 'ST-004', name: 'Imran Butt', role: 'pharmacist', department: 'Pharmacy', email: 'imran.butt@subhancare.pk', phone: '0333-9988776', status: 'active', lastLogin: '2026-07-02 16:30' },
  { id: 'ST-005', name: 'Nadia Qureshi', role: 'billing', department: 'Billing', email: 'nadia.q@subhancare.pk', phone: '0311-6655443', status: 'inactive', lastLogin: '2026-06-25 11:00' },
];

const BLANK = { name: '', role: '', department: '', email: '', phone: '' };

const validate = (form) => {
  const e = {};
  if (!form.name.trim()) e.name = 'Name is required';
  if (!form.role) e.role = 'Role is required';
  if (!form.department) e.department = 'Department is required';
  if (!form.email.trim()) e.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
  if (!form.phone.trim()) e.phone = 'Phone is required';
  return e;
};

const StaffModal = ({ staff, onClose, onSave }) => {
  const isEdit = !!staff?.id;
  const [form, setForm] = useState(isEdit ? { ...staff } : { ...BLANK });
  const [errors, setErrors] = useState({});
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave(form);
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="staff-modal-title" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <h2 id="staff-modal-title">{isEdit ? 'Edit Staff Account' : 'Add Staff Account'}</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>
        <form className="modal-form" onSubmit={handleSubmit} noValidate>
          <div className={`form-field ${errors.name ? 'has-error' : ''}`}>
            <label htmlFor="st-name">Full Name *</label>
            <input id="st-name" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Staff member full name" />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>
          <div className="form-row">
            <div className={`form-field ${errors.role ? 'has-error' : ''}`}>
              <label htmlFor="st-role">System Role *</label>
              <select id="st-role" value={form.role} onChange={(e) => set('role', e.target.value)}>
                <option value="">Select role</option>
                {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
              </select>
              {errors.role && <span className="field-error">{errors.role}</span>}
            </div>
            <div className={`form-field ${errors.department ? 'has-error' : ''}`}>
              <label htmlFor="st-dept">Department *</label>
              <select id="st-dept" value={form.department} onChange={(e) => set('department', e.target.value)}>
                <option value="">Select department</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              {errors.department && <span className="field-error">{errors.department}</span>}
            </div>
          </div>
          <div className="form-row">
            <div className={`form-field ${errors.email ? 'has-error' : ''}`}>
              <label htmlFor="st-email">Email *</label>
              <input id="st-email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="user@subhancare.pk" />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>
            <div className={`form-field ${errors.phone ? 'has-error' : ''}`}>
              <label htmlFor="st-phone">Phone *</label>
              <input id="st-phone" type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="03XX-XXXXXXX" />
              {errors.phone && <span className="field-error">{errors.phone}</span>}
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{isEdit ? 'Save Changes' : 'Create Account'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};


const ROLE_COLORS = { admin: 'blue', doctor: 'green', receptionist: 'gray', pharmacist: 'gray', billing: 'amber' };

const Staff = () => {
  const { canEdit } = useAuth();
  const isAdmin = canEdit('staff');

  const [staff, setStaff] = useState(INITIAL_STAFF);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [modal, setModal] = useState(null);
  const { toast, showToast } = useToast();

  if (!isAdmin) return (
    <div className="page-centered">
      <EmptyState icon={UserCog} message="You do not have permission to access Staff Management." />
    </div>
  );

  const filtered = staff.filter((s) => {
    const q = search.toLowerCase();
    return (s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)) &&
           (!filterRole || s.role === filterRole);
  });

  const handleSave = (form) => {
    if (form.id) {
      setStaff((prev) => prev.map((s) => s.id === form.id ? { ...s, ...form } : s));
      showToast('Staff account updated.');
    } else {
      setStaff((prev) => [...prev, { ...form, id: `ST-00${staff.length + 1}`, status: 'active', lastLogin: '—' }]);
      showToast('New staff account created.');
    }
    setModal(null);
  };

  const handleToggle = (member) => {
    setStaff((prev) => prev.map((s) => s.id === member.id ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s));
    showToast(`${member.name} ${member.status === 'active' ? 'deactivated' : 'reactivated'}.`);
    setModal(null);
  };

  const handleResetPw = () => { showToast('Password reset email sent.'); setModal(null); };

  return (
    <div className="staff-page">
      <div className="page-header">
        <div>
          <h2>Staff Management</h2>
          <p className="page-subtitle">{staff.filter(s => s.status === 'active').length} active accounts</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({ type: 'add' })}>
          <Plus size={16} /> Add Staff
        </button>
      </div>

      <div className="table-controls">
        <div className="search-box">
          <Search size={16} />
          <input type="search" placeholder="Search by name or email…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search staff" />
        </div>
        <div className="filter-group">
          <ChevronDown size={14} className="filter-icon" />
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} aria-label="Filter by role">
            <option value="">All Roles</option>
            {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
          </select>
        </div>
      </div>

      <div className="table-container">
        {filtered.length === 0 ? (
          <EmptyState icon={UserCog} message="No staff members match your search." actionLabel="Clear" onAction={() => { setSearch(''); setFilterRole(''); }} />
        ) : (
          <table className="data-table" aria-label="Staff accounts">
            <thead>
              <tr>
                <th>Staff Member</th>
                <th>Role</th>
                <th>Department</th>
                <th>Phone</th>
                <th>Last Login</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((member) => (
                <tr key={member.id}>
                  <td>
                    <div className="staff-cell">
                      <div className="staff-avatar">{member.name.split(' ').slice(0,2).map(w => w[0]).join('')}</div>
                      <div>
                        <div className="staff-name">{member.name}</div>
                        <div className="text-muted">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className={`badge badge--${ROLE_COLORS[member.role] || 'gray'}`}>{member.role.charAt(0).toUpperCase() + member.role.slice(1)}</span></td>
                  <td className="text-secondary">{member.department}</td>
                  <td className="text-secondary">{member.phone}</td>
                  <td className="text-muted">{member.lastLogin}</td>
                  <td><StatusBadge status={member.status === 'active' ? 'confirmed' : 'cancelled'} customLabel={member.status === 'active' ? 'Active' : 'Inactive'} /></td>
                  <td>
                    <div className="action-btns">
                      <button className="icon-btn" title="Edit" onClick={() => setModal({ type: 'edit', data: member })} aria-label={`Edit ${member.name}`}><Edit2 size={15} /></button>
                      <button className="icon-btn" title="Reset Password" onClick={() => setModal({ type: 'reset-pw', data: member })} aria-label="Reset password"><KeyRound size={15} /></button>
                      <button className={`icon-btn ${member.status === 'active' ? 'icon-btn--danger' : 'icon-btn--success'}`} title={member.status === 'active' ? 'Deactivate' : 'Reactivate'} onClick={() => setModal({ type: 'toggle', data: member })} aria-label={`${member.status === 'active' ? 'Deactivate' : 'Reactivate'} ${member.name}`}>
                        {member.status === 'active' ? <UserX size={15} /> : <UserCheck size={15} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal?.type === 'add'    && <StaffModal onClose={() => setModal(null)} onSave={handleSave} />}
      {modal?.type === 'edit'   && <StaffModal staff={modal.data} onClose={() => setModal(null)} onSave={handleSave} />}
      {modal?.type === 'toggle' && <ConfirmModal message={`${modal.data.status === 'active' ? 'Deactivate' : 'Reactivate'} account for ${modal.data.name}?`} confirmLabel={modal.data.status === 'active' ? 'Deactivate' : 'Reactivate'} variant={modal.data.status === 'active' ? 'danger' : 'secondary'} onConfirm={() => handleToggle(modal.data)} onClose={() => setModal(null)} />}
      {modal?.type === 'reset-pw' && <ConfirmModal message={`Send password reset email to ${modal.data.email}?`} confirmLabel="Send Reset Email" variant="primary" onConfirm={handleResetPw} onClose={() => setModal(null)} />}

      {toast && <div className="toast toast--success" role="status">{toast}</div>}
    </div>
  );
};

export default Staff;
