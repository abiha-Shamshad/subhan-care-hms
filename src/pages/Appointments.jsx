import { useState } from 'react';
import {
  CalendarDays, Plus, Search, ChevronDown, X, Clock,
  CheckCircle2, XCircle, AlertCircle, LayoutList, LayoutGrid
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';
import useToast from '../hooks/useToast';
import './Appointments.css';

const DOCTORS = ['Dr. Fatima Noor', 'Dr. Usman Ali', 'Dr. Ayesha Tariq', 'Dr. Bilal Mahmood', 'Dr. Sana Riaz'];
const APPT_TYPES = ['Consultation', 'Follow-up', 'Emergency', 'Procedure', 'Check-up'];
const STATUS_OPTIONS = ['pending', 'confirmed', 'completed', 'cancelled'];

const INITIAL_APPTS = [
  { id: 'APT-001', patientName: 'Ahmed Khan', patientId: 'PT-1001', doctor: 'Dr. Fatima Noor', date: '2026-07-03', time: '09:00', type: 'Consultation', status: 'confirmed', notes: '' },
  { id: 'APT-002', patientName: 'Sara Malik', patientId: 'PT-1002', doctor: 'Dr. Usman Ali', date: '2026-07-03', time: '09:30', type: 'Follow-up', status: 'confirmed', notes: 'Post-op check' },
  { id: 'APT-003', patientName: 'Hassan Raza', patientId: 'PT-1003', doctor: 'Dr. Ayesha Tariq', date: '2026-07-03', time: '10:00', type: 'Check-up', status: 'pending', notes: '' },
  { id: 'APT-004', patientName: 'Maryam Iqbal', patientId: 'PT-1004', doctor: 'Dr. Sana Riaz', date: '2026-07-03', time: '11:00', type: 'Consultation', status: 'completed', notes: '' },
  { id: 'APT-005', patientName: 'Bilal Chaudhry', patientId: 'PT-1005', doctor: 'Dr. Fatima Noor', date: '2026-07-04', time: '09:00', type: 'Emergency', status: 'pending', notes: 'Chest pain' },
  { id: 'APT-006', patientName: 'Nida Hussain', patientId: 'PT-1006', doctor: 'Dr. Usman Ali', date: '2026-07-04', time: '10:30', type: 'Follow-up', status: 'cancelled', notes: '' },
  { id: 'APT-007', patientName: 'Tariq Butt', patientId: 'PT-1007', doctor: 'Dr. Bilal Mahmood', date: '2026-07-05', time: '14:00', type: 'Consultation', status: 'confirmed', notes: '' },
];

const TIME_SLOTS = ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00'];

const STATUS_META = {
  pending:   { icon: Clock,          label: 'Pending',   next: 'confirmed' },
  confirmed: { icon: CheckCircle2,   label: 'Confirmed', next: 'completed' },
  completed: { icon: CheckCircle2,   label: 'Completed', next: null },
  cancelled: { icon: XCircle,        label: 'Cancelled', next: null },
};

const BLANK_FORM = { patientName: '', patientId: '', doctor: '', date: '', time: '', type: '', notes: '' };

const validate = (form) => {
  const e = {};
  if (!form.patientName.trim()) e.patientName = 'Patient name is required';
  if (!form.doctor) e.doctor = 'Doctor is required';
  if (!form.date) e.date = 'Date is required';
  if (!form.time) e.time = 'Time is required';
  if (!form.type) e.type = 'Appointment type is required';
  return e;
};

const BookModal = ({ appt, appts, onClose, onSave }) => {
  const isEdit = !!appt?.id;
  const [form, setForm] = useState(isEdit ? { ...appt } : { ...BLANK_FORM });
  const [errors, setErrors] = useState({});
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const isConflict = !isEdit && form.doctor && form.date && form.time &&
    appts.some(a => a.doctor === form.doctor && a.date === form.date && a.time === form.time && a.status !== 'cancelled');

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    if (isConflict) return;
    onSave(form);
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="appt-modal-title" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <h2 id="appt-modal-title">{isEdit ? 'Edit Appointment' : 'Book Appointment'}</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>
        <form className="modal-form" onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <div className={`form-field ${errors.patientName ? 'has-error' : ''}`}>
              <label htmlFor="apt-patient">Patient Name *</label>
              <input id="apt-patient" value={form.patientName} onChange={(e) => set('patientName', e.target.value)} placeholder="Patient full name" />
              {errors.patientName && <span className="field-error">{errors.patientName}</span>}
            </div>
            <div className={`form-field ${errors.doctor ? 'has-error' : ''}`}>
              <label htmlFor="apt-doctor">Doctor *</label>
              <select id="apt-doctor" value={form.doctor} onChange={(e) => set('doctor', e.target.value)}>
                <option value="">Select doctor</option>
                {DOCTORS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              {errors.doctor && <span className="field-error">{errors.doctor}</span>}
            </div>
          </div>
          <div className="form-row">
            <div className={`form-field ${errors.date ? 'has-error' : ''}`}>
              <label htmlFor="apt-date">Date *</label>
              <input id="apt-date" type="date" value={form.date} onChange={(e) => set('date', e.target.value)} />
              {errors.date && <span className="field-error">{errors.date}</span>}
            </div>
            <div className={`form-field ${errors.time ? 'has-error' : ''}`}>
              <label htmlFor="apt-time">Time Slot *</label>
              <select id="apt-time" value={form.time} onChange={(e) => set('time', e.target.value)}>
                <option value="">Select time</option>
                {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.time && <span className="field-error">{errors.time}</span>}
            </div>
          </div>
          <div className={`form-field ${errors.type ? 'has-error' : ''}`}>
            <label htmlFor="apt-type">Appointment Type *</label>
            <select id="apt-type" value={form.type} onChange={(e) => set('type', e.target.value)}>
              <option value="">Select type</option>
              {APPT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            {errors.type && <span className="field-error">{errors.type}</span>}
          </div>
          {isConflict && (
            <div className="alert-banner alert-banner--warning">
              <AlertCircle size={16} />
              Time slot conflict: {form.doctor} already has an appointment at {form.time} on {form.date}.
            </div>
          )}
          <div className="form-field">
            <label htmlFor="apt-notes">Notes</label>
            <textarea id="apt-notes" value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Optional notes…" rows={3} />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isConflict}>{isEdit ? 'Save Changes' : 'Book Appointment'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 7-day calendar view component
const CalendarView = ({ appts, canBook, onBook }) => {
  const today = new Date('2026-07-03');
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });

  const fmt = (d) => d.toISOString().split('T')[0];
  const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="calendar-grid">
      {days.map((day) => {
        const dateStr = fmt(day);
        const dayAppts = appts.filter(a => a.date === dateStr);
        const isToday = dateStr === fmt(today);
        return (
          <div key={dateStr} className={`calendar-day ${isToday ? 'today' : ''}`}>
            <div className="calendar-day-header">
              <span className="cal-day-name">{DAY_NAMES[day.getDay()]}</span>
              <span className={`cal-day-num ${isToday ? 'today-num' : ''}`}>{day.getDate()}</span>
              {canBook && <button className="cal-add-btn" onClick={() => onBook(dateStr)} title="Book appointment" aria-label="Add appointment"><Plus size={12} /></button>}
            </div>
            <div className="calendar-day-body">
              {dayAppts.length === 0
                ? <span className="cal-empty">No appointments</span>
                : dayAppts.map((a) => (
                  <div key={a.id} className={`cal-appt-chip cal-appt--${a.status}`}>
                    <span className="cal-appt-time">{a.time}</span>
                    <span className="cal-appt-patient">{a.patientName}</span>
                    <span className="cal-appt-doctor text-muted">{a.doctor.split(' ').pop()}</span>
                  </div>
                ))
              }
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Appointments = () => {
  const { role, canEdit } = useAuth();
  const isAdmin = canEdit('appointments');
  const isDoctor = role === 'doctor';

  const [appts, setAppts] = useState(INITIAL_APPTS);
  const [view, setView] = useState('list');
  const [search, setSearch] = useState('');
  const [filterDoctor, setFilterDoctor] = useState(isDoctor ? 'Dr. Fatima Noor' : '');
  const [filterStatus, setFilterStatus] = useState('');
  const [modal, setModal] = useState(null);
  const { toast, showToast } = useToast();

  // Doctor sees own appointments only
  const baseAppts = isDoctor ? appts.filter(a => a.doctor === 'Dr. Fatima Noor') : appts;

  const filtered = baseAppts.filter((a) => {
    const q = search.toLowerCase();
    return (a.patientName.toLowerCase().includes(q) || a.doctor.toLowerCase().includes(q)) &&
           (!filterDoctor || a.doctor === filterDoctor) &&
           (!filterStatus || a.status === filterStatus);
  });

  const handleSave = (form) => {
    if (form.id) {
      setAppts((prev) => prev.map((a) => a.id === form.id ? { ...a, ...form } : a));
    } else {
      const id = `APT-${String(appts.length + 1).padStart(3, '0')}`;
      setAppts((prev) => [...prev, { ...form, id, status: 'pending' }]);
    }
    showToast('Appointment saved.');
    setModal(null);
  };

  const handleAdvanceStatus = (appt) => {
    const next = STATUS_META[appt.status]?.next;
    if (!next) return;
    setAppts((prev) => prev.map((a) => a.id === appt.id ? { ...a, status: next } : a));
    showToast(`Marked as ${next}.`);
  };

  const handleCancel = (appt) => {
    setAppts((prev) => prev.map((a) => a.id === appt.id ? { ...a, status: 'cancelled' } : a));
    showToast('Appointment cancelled.');
    setModal(null);
  };

  const todayCount = appts.filter(a => a.date === '2026-07-03' && a.status !== 'cancelled').length;
  const pendingCount = appts.filter(a => a.status === 'pending').length;

  return (
    <div className="appts-page">
      <div className="page-header">
        <div>
          <h2>Appointment Scheduling</h2>
          <p className="page-subtitle">{todayCount} today · {pendingCount} pending confirmation</p>
        </div>
        <div className="appt-header-actions">
          <div className="view-toggle" role="group" aria-label="View mode">
            <button className={`view-btn ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')} aria-pressed={view === 'list'} aria-label="List view"><LayoutList size={16} /></button>
            <button className={`view-btn ${view === 'calendar' ? 'active' : ''}`} onClick={() => setView('calendar')} aria-pressed={view === 'calendar'} aria-label="Calendar view"><LayoutGrid size={16} /></button>
          </div>
          {!isDoctor && (
            <button className="btn btn-primary" onClick={() => setModal({ type: 'book' })}>
              <Plus size={16} /> Book Appointment
            </button>
          )}
        </div>
      </div>

      {view === 'calendar' ? (
        <CalendarView appts={filtered} canBook={!isDoctor} onBook={(date) => setModal({ type: 'book', data: { date } })} />
      ) : (
        <>
          <div className="table-controls">
            <div className="search-box">
              <Search size={16} />
              <input type="search" placeholder="Search by patient or doctor…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search appointments" />
            </div>
            {!isDoctor && (
              <div className="filter-group">
                <ChevronDown size={14} className="filter-icon" />
                <select value={filterDoctor} onChange={(e) => setFilterDoctor(e.target.value)} aria-label="Filter by doctor">
                  <option value="">All Doctors</option>
                  {DOCTORS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            )}
            <div className="filter-group">
              <ChevronDown size={14} className="filter-icon" />
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} aria-label="Filter by status">
                <option value="">All Statuses</option>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
          </div>

          <div className="table-container">
            {filtered.length === 0 ? (
              <EmptyState icon={CalendarDays} message="No appointments found." actionLabel="Clear Filters" onAction={() => { setSearch(''); setFilterDoctor(isDoctor ? 'Dr. Fatima Noor' : ''); setFilterStatus(''); }} />
            ) : (
              <table className="data-table" aria-label="Appointments list">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Date & Time</th>
                    <th>Type</th>
                    <th>Status</th>
                    {!isDoctor && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a) => {
                    const meta = STATUS_META[a.status];
                    return (
                      <tr key={a.id}>
                        <td>
                          <div className="appt-patient-cell">
                            <div className="appt-avatar">{a.patientName.split(' ').map(w => w[0]).join('').slice(0,2)}</div>
                            <div>
                              <div className="cell-name">{a.patientName}</div>
                              <div className="text-muted">{a.patientId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="text-secondary">{a.doctor}</td>
                        <td>
                          <div className="cell-name">{a.date}</div>
                          <div className="text-muted">{a.time}</div>
                        </td>
                        <td><span className="appt-type-tag">{a.type}</span></td>
                        <td><StatusBadge status={a.status} label={meta.label} /></td>
                        {!isDoctor && (
                          <td>
                            <div className="action-btns">
                              {meta.next && (
                                <button className="icon-btn icon-btn--success" title={`Mark as ${meta.next}`} onClick={() => handleAdvanceStatus(a)} aria-label={`Advance to ${meta.next}`}><CheckCircle2 size={15} /></button>
                              )}
                              {a.status !== 'completed' && a.status !== 'cancelled' && (
                                <button className="icon-btn" title="Edit" onClick={() => setModal({ type: 'edit', data: a })} aria-label="Edit appointment"><Plus size={15} className="icon-rotate-45" aria-hidden="true" /></button>
                              )}
                              {(a.status === 'pending' || a.status === 'confirmed') && (
                                <button className="icon-btn icon-btn--danger" title="Cancel" onClick={() => setModal({ type: 'cancel', data: a })} aria-label="Cancel appointment"><XCircle size={15} /></button>
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
        </>
      )}

      {(modal?.type === 'book' || modal?.type === 'edit') && (
        <BookModal appt={modal.data} appts={appts} onClose={() => setModal(null)} onSave={handleSave} />
      )}
      {modal?.type === 'cancel' && (
        <ConfirmModal
          title="Cancel Appointment"
          message={`Cancel appointment for ${modal.data.patientName} with ${modal.data.doctor} on ${modal.data.date} at ${modal.data.time}?`}
          confirmLabel="Cancel Appointment"
          cancelLabel="Keep"
          variant="danger"
          onConfirm={() => handleCancel(modal.data)}
          onClose={() => setModal(null)}
        />
      )}

      {toast && <div className="toast toast--success" role="status">{toast}</div>}
    </div>
  );
};

export default Appointments;
