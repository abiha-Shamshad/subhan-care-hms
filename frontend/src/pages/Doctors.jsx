import { useState } from 'react';
import {
  Search, Plus, Edit2, PowerOff, Power, X, ChevronDown, Trash2,
  Stethoscope, Phone, Mail, Calendar, Users, Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ConfirmModal from '../components/ConfirmModal';
import './Doctors.css';

const SPECIALTIES = ['Cardiology', 'Orthopedics', 'Pediatrics', 'General Medicine', 'Gynecology', 'Neurology', 'Dermatology', 'Ophthalmology'];

const INITIAL_DOCTORS = [
  { id: 'DR-001', name: 'Dr. Fatima Noor', specialty: 'Cardiology', qualification: 'MBBS, FCPS (Cardiology)', phone: '0300-1112233', email: 'fatima.noor@subhancare.pk', schedule: 'Mon, Wed, Fri', patients: 124, status: 'active', experience: '12 years' },
  { id: 'DR-002', name: 'Dr. Usman Ali', specialty: 'Orthopedics', qualification: 'MBBS, MS (Ortho)', phone: '0321-4445566', email: 'usman.ali@subhancare.pk', schedule: 'Tue, Thu, Sat', patients: 89, status: 'active', experience: '8 years' },
  { id: 'DR-003', name: 'Dr. Ayesha Tariq', specialty: 'Pediatrics', qualification: 'MBBS, DCH', phone: '0333-7778899', email: 'ayesha.tariq@subhancare.pk', schedule: 'Mon–Fri', patients: 201, status: 'active', experience: '15 years' },
  { id: 'DR-004', name: 'Dr. Bilal Mahmood', specialty: 'Neurology', qualification: 'MBBS, FCPS (Neurology)', phone: '0311-0001122', email: 'bilal.mahmood@subhancare.pk', schedule: 'Mon, Thu', patients: 67, status: 'on-leave', experience: '6 years' },
  { id: 'DR-005', name: 'Dr. Sana Riaz', specialty: 'Gynecology', qualification: 'MBBS, MRCOG', phone: '0345-3334455', email: 'sana.riaz@subhancare.pk', schedule: 'Tue, Wed, Fri', patients: 158, status: 'active', experience: '10 years' },
];

const BLANK_FORM = { name: '', specialty: '', qualification: '', phone: '', email: '', schedule: '', experience: '' };

const validate = (form) => {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Full name is required';
  if (!form.specialty) errors.specialty = 'Specialty is required';
  if (!form.qualification.trim()) errors.qualification = 'Qualification is required';
  if (!form.phone.trim()) errors.phone = 'Phone number is required';
  if (!form.email.trim()) errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Invalid email address';
  return errors;
};

const DoctorModal = ({ doctor, onClose, onSave }) => {
  const isEdit = !!doctor?.id;
  const [form, setForm] = useState(isEdit ? { ...doctor } : { ...BLANK_FORM });
  const [errors, setErrors] = useState({});

  const set = (field, val) => setForm((f) => ({ ...f, [field]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave(form);
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="doctor-modal-title" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <h2 id="doctor-modal-title">{isEdit ? 'Edit Doctor Profile' : 'Add New Doctor'}</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal"><X size={20} /></button>
        </div>
        <form className="modal-form" onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <div className={`form-field ${errors.name ? 'has-error' : ''}`}>
              <label htmlFor="dr-name">Full Name *</label>
              <input id="dr-name" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Dr. Full Name" />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>
            <div className={`form-field ${errors.specialty ? 'has-error' : ''}`}>
              <label htmlFor="dr-specialty">Specialty *</label>
              <select id="dr-specialty" value={form.specialty} onChange={(e) => set('specialty', e.target.value)}>
                <option value="">Select specialty</option>
                {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.specialty && <span className="field-error">{errors.specialty}</span>}
            </div>
          </div>
          <div className={`form-field ${errors.qualification ? 'has-error' : ''}`}>
            <label htmlFor="dr-qual">Qualifications *</label>
            <input id="dr-qual" value={form.qualification} onChange={(e) => set('qualification', e.target.value)} placeholder="e.g. MBBS, FCPS (Cardiology)" />
            {errors.qualification && <span className="field-error">{errors.qualification}</span>}
          </div>
          <div className="form-row">
            <div className={`form-field ${errors.phone ? 'has-error' : ''}`}>
              <label htmlFor="dr-phone">Phone *</label>
              <input id="dr-phone" type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="03XX-XXXXXXX" />
              {errors.phone && <span className="field-error">{errors.phone}</span>}
            </div>
            <div className={`form-field ${errors.email ? 'has-error' : ''}`}>
              <label htmlFor="dr-email">Email *</label>
              <input id="dr-email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="doctor@subhancare.pk" />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="dr-schedule">Schedule</label>
              <input id="dr-schedule" value={form.schedule} onChange={(e) => set('schedule', e.target.value)} placeholder="e.g. Mon, Wed, Fri" />
            </div>
            <div className="form-field">
              <label htmlFor="dr-exp">Experience</label>
              <input id="dr-exp" value={form.experience} onChange={(e) => set('experience', e.target.value)} placeholder="e.g. 10 years" />
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{isEdit ? 'Save Changes' : 'Add Doctor'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};


const Doctors = () => {
  const { role, canEdit } = useAuth();
  const isAdmin = canEdit('doctors');

  const [doctors, setDoctors] = useState(INITIAL_DOCTORS);
  const [search, setSearch] = useState('');
  const [filterSpec, setFilterSpec] = useState('');
  const [modal, setModal] = useState(null); // null | { type: 'add'|'edit'|'confirm', data? }
  const [loading] = useState(false);

  // Doctor role sees only own profile card
  if (role === 'doctor') {
    const own = INITIAL_DOCTORS[0]; // ponytail: mock "own" doctor = first record
    return (
      <div className="doctors-page">
        <div className="page-header"><h2>My Profile</h2></div>
        <div className="doctor-own-card">
          <div className="doc-avatar-lg">{own.name.split(' ').map(w => w[0]).join('').slice(0, 2)}</div>
          <div className="doc-own-details">
            <h3>{own.name}</h3>
            <span className="doc-specialty-tag">{own.specialty}</span>
            <p className="doc-qual"><Award size={14} /> {own.qualification}</p>
            <div className="doc-own-grid">
              <div><Phone size={14} /><span>{own.phone}</span></div>
              <div><Mail size={14} /><span>{own.email}</span></div>
              <div><Calendar size={14} /><span>{own.schedule}</span></div>
              <div><Users size={14} /><span>{own.patients} Patients</span></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filtered = doctors.filter((d) => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.specialty.toLowerCase().includes(search.toLowerCase());
    const matchesSpec = !filterSpec || d.specialty === filterSpec;
    return matchesSearch && matchesSpec;
  });

  const handleSave = (form) => {
    if (form.id) {
      setDoctors((prev) => prev.map((d) => d.id === form.id ? { ...d, ...form } : d));
    } else {
      const newDoc = { ...form, id: `DR-00${doctors.length + 1}`, patients: 0, status: 'active' };
      setDoctors((prev) => [...prev, newDoc]);
    }
    setModal(null);
  };

  const handleToggleStatus = (doc) => {
    const newStatus = doc.status === 'active' ? 'on-leave' : 'active';
    setDoctors((prev) => prev.map((d) => d.id === doc.id ? { ...d, status: newStatus } : d));
    setModal(null);
  };

  const handleDelete = (doc) => {
    setDoctors((prev) => prev.filter((d) => d.id !== doc.id));
    setModal(null);
  };

  return (
    <div className="doctors-page">
      <div className="page-header">
        <div>
          <h2>Doctor Directory</h2>
          <p className="page-subtitle">{doctors.filter(d => d.status === 'active').length} active doctors on staff</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setModal({ type: 'add' })}>
            <Plus size={16} /> Add Doctor
          </button>
        )}
      </div>

      <div className="table-controls">
        <div className="search-box">
          <Search size={16} />
          <input type="search" placeholder="Search by name or specialty…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search doctors" />
        </div>
        <div className="filter-group">
          <ChevronDown size={14} className="filter-icon" />
          <select value={filterSpec} onChange={(e) => setFilterSpec(e.target.value)} aria-label="Filter by specialty">
            <option value="">All Specialties</option>
            {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <LoadingSkeleton rows={5} />
        ) : filtered.length === 0 ? (
          <EmptyState icon={Stethoscope} message="No doctors match your search." actionLabel="Clear Search" onAction={() => { setSearch(''); setFilterSpec(''); }} />
        ) : (
          <table className="data-table" aria-label="Doctor directory">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Specialty</th>
                <th>Qualification</th>
                <th>Schedule</th>
                <th>Patients</th>
                <th>Status</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((doc) => (
                <tr key={doc.id}>
                  <td>
                    <div className="doc-cell">
                      <div className="doc-avatar">{doc.name.split(' ').filter(Boolean).slice(0,2).map(w => w[0]).join('')}</div>
                      <div>
                        <div className="doc-name">{doc.name}</div>
                        <div className="doc-sub">{doc.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="doc-specialty-tag">{doc.specialty}</span></td>
                  <td className="text-secondary">{doc.qualification}</td>
                  <td className="text-secondary">{doc.schedule}</td>
                  <td><span className="patient-count"><Users size={13} /> {doc.patients}</span></td>
                  <td><StatusBadge status={doc.status === 'active' ? 'confirmed' : 'cancelled'} label={doc.status === 'active' ? 'Active' : 'On Leave'} /></td>
                  {isAdmin && (
                    <td>
                      <div className="action-btns">
                        <button className="icon-btn" title="Edit doctor" onClick={() => setModal({ type: 'edit', data: doc })} aria-label={`Edit ${doc.name}`}><Edit2 size={15} /></button>
                        <button className={`icon-btn ${doc.status === 'active' ? 'icon-btn--warning' : 'icon-btn--success'}`} title={doc.status === 'active' ? 'Set On Leave' : 'Reactivate'} onClick={() => setModal({ type: 'confirm', data: doc })} aria-label={`${doc.status === 'active' ? 'Deactivate' : 'Reactivate'} ${doc.name}`}>
                          {doc.status === 'active' ? <PowerOff size={15} /> : <Power size={15} />}
                        </button>
                        <button className="icon-btn icon-btn--danger" title="Delete doctor" onClick={() => setModal({ type: 'delete', data: doc })} aria-label={`Delete ${doc.name}`}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal?.type === 'add' && <DoctorModal onClose={() => setModal(null)} onSave={handleSave} />}
      {modal?.type === 'edit' && <DoctorModal doctor={modal.data} onClose={() => setModal(null)} onSave={handleSave} />}
      {modal?.type === 'confirm' && (
        <ConfirmModal
          title="Confirm Status Change"
          message={`Are you sure you want to ${modal.data.status === 'active' ? 'set On Leave' : 'reactivate'} ${modal.data.name}?`}
          confirmLabel={modal.data.status === 'active' ? 'Set On Leave' : 'Reactivate'}
          variant={modal.data.status === 'active' ? 'warning' : 'secondary'}
          onConfirm={() => handleToggleStatus(modal.data)}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === 'delete' && (
        <ConfirmModal
          title="Delete Doctor"
          message={`Permanently remove ${modal.data.name} (${modal.data.id}) from the directory? This cannot be undone.`}
          confirmLabel="Delete"
          variant="danger"
          onConfirm={() => handleDelete(modal.data)}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
};

export default Doctors;
