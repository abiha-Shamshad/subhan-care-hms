import { useState } from 'react';
import {
  CalendarDays, Plus, Search, ChevronDown, X, Clock,
  CheckCircle2, XCircle, AlertCircle, LayoutList, LayoutGrid, CalendarClock, ClipboardList
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ConfirmModal from '../components/ConfirmModal';
import useToast from '../hooks/useToast';
import useApiResource from '../hooks/useApiResource';
import useTableFilters from '../hooks/useTableFilters';
import { appointmentService, doctorService, patientService } from '../services/api';
import './Appointments.css';

const APPT_TYPES = ['Consultation', 'Follow-up', 'Emergency', 'Procedure', 'Check-up'];
const STATUS_OPTIONS = ['pending', 'confirmed', 'completed', 'cancelled'];

const TIME_SLOTS = ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00'];

const STATUS_META = {
  pending:   { icon: Clock,          label: 'Pending',   next: 'confirmed' },
  confirmed: { icon: CheckCircle2,   label: 'Confirmed', next: 'completed' },
  completed: { icon: CheckCircle2,   label: 'Completed', next: null },
  cancelled: { icon: XCircle,        label: 'Cancelled', next: null },
};

const BLANK_FORM = { patientId: '', doctorId: '', date: '', time: '', type: '', notes: '' };

const validate = (form) => {
  const e = {};
  if (!form.patientId) e.patientId = 'Patient is required';
  if (!form.doctorId) e.doctorId = 'Doctor is required';
  if (!form.date) e.date = 'Date is required';
  if (!form.time) e.time = 'Time is required';
  if (!form.type) e.type = 'Appointment type is required';
  return e;
};

const BookModal = ({ appt, appts, patients, doctors, onClose, onSave }) => {
  const isEdit = !!appt?.id;
  const [form, setForm] = useState(isEdit ? { ...appt } : { ...BLANK_FORM, ...(appt || {}) });
  const [errors, setErrors] = useState({});
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const isConflict = !isEdit && form.doctorId && form.date && form.time &&
    appts.some(a => a.doctorId?.doctorId === form.doctorId && a.date === form.date && a.time === form.time && a.status !== 'cancelled');

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
            <div className={`form-field ${errors.patientId ? 'has-error' : ''}`}>
              <label htmlFor="apt-patient">Patient *</label>
              <select id="apt-patient" value={form.patientId} onChange={(e) => set('patientId', e.target.value)}>
                <option value="">Select patient</option>
                {patients.map((p) => <option key={p.patientId} value={p.patientId}>{p.name} ({p.patientId})</option>)}
              </select>
              {errors.patientId && <span className="field-error">{errors.patientId}</span>}
            </div>
            <div className={`form-field ${errors.doctorId ? 'has-error' : ''}`}>
              <label htmlFor="apt-doctor">Doctor *</label>
              <select id="apt-doctor" value={form.doctorId} onChange={(e) => set('doctorId', e.target.value)}>
                <option value="">Select doctor</option>
                {doctors.map((d) => <option key={d.doctorId} value={d.doctorId}>{d.name}</option>)}
              </select>
              {errors.doctorId && <span className="field-error">{errors.doctorId}</span>}
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
              Time slot conflict: this doctor already has an appointment at {form.time} on {form.date}.
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

// Focused reschedule modal — changes date + time only, keeping the rest of
// the appointment intact, with a same-doctor slot-conflict check.
const RescheduleModal = ({ appt, appts, onClose, onSave }) => {
  const [date, setDate] = useState(appt.date);
  const [time, setTime] = useState(appt.time);
  const [error, setError] = useState('');

  const conflict = date && time && appts.some(
    a => a.apptId !== appt.apptId && a.doctor === appt.doctor && a.date === date && a.time === time && a.status !== 'cancelled'
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!date || !time) { setError('Both date and time are required.'); return; }
    if (conflict) return;
    // A rescheduled confirmed appointment reverts to pending for re-confirmation.
    onSave({ apptId: appt.apptId, date, time, status: appt.status === 'confirmed' ? 'pending' : appt.status });
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="resched-modal-title" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box modal-box--sm">
        <div className="modal-header">
          <h2 id="resched-modal-title">Reschedule Appointment</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>
        <form className="modal-form" onSubmit={handleSubmit} noValidate>
          <p className="modal-confirm-text">
            <strong>{appt.patientName}</strong> with <strong>{appt.doctor}</strong>
            <br />
            <span className="text-muted">Currently: {appt.date} at {appt.time}</span>
          </p>
          <div className="form-row">
            <div className={`form-field ${error && !date ? 'has-error' : ''}`}>
              <label htmlFor="resched-date">New Date *</label>
              <input id="resched-date" type="date" value={date} onChange={(e) => { setDate(e.target.value); setError(''); }} />
            </div>
            <div className={`form-field ${error && !time ? 'has-error' : ''}`}>
              <label htmlFor="resched-time">New Time Slot *</label>
              <select id="resched-time" value={time} onChange={(e) => { setTime(e.target.value); setError(''); }}>
                <option value="">Select time</option>
                {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          {error && <span className="field-error">{error}</span>}
          {conflict && (
            <div className="alert-banner alert-banner--warning">
              <AlertCircle size={16} />
              Slot conflict: {appt.doctor} already has an appointment at {time} on {date}.
            </div>
          )}
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={conflict}>Confirm Reschedule</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 7-day calendar view component
const CalendarView = ({ appts, canBook, onBook }) => {
  const today = new Date();
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
                  <div key={a.apptId} className={`cal-appt-chip cal-appt--${a.status}`}>
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
  const { role } = useAuth();
  const { navigate } = useNavigation();
  const isDoctor = role === 'doctor';

  const { data: appts, loading, error, refetch } = useApiResource(() => appointmentService.getAll());
  // Booking/filtering by doctor is receptionist/admin-only — doctors can't view the
  // doctors module at all, so skip a fetch that would otherwise 403 for them.
  const { data: doctorList } = useApiResource(() => (isDoctor ? Promise.resolve([]) : doctorService.getAll()), [isDoctor]);
  const { data: patientList } = useApiResource(() => (isDoctor ? Promise.resolve([]) : patientService.getAll()), [isDoctor]);

  const [view, setView] = useState('list');
  const [modal, setModal] = useState(null);
  const { toast, showToast } = useToast();

  const allAppts = appts || [];
  const doctors = doctorList || [];
  const patients = patientList || [];

  const {
    filtered, search, setSearch, filterValues, setFilter, dateFrom, setDateFrom, dateTo, setDateTo, clearAll,
  } = useTableFilters(allAppts, {
    searchFields: [(a) => a.patientName, (a) => a.doctor],
    filters: { doctor: (a) => a.doctor, status: (a) => a.status },
    dateField: (a) => a.date,
  });

  const handleSave = async (form) => {
    try {
      const payload = { patientId: form.patientId, doctorId: form.doctorId, date: form.date, time: form.time, type: form.type, notes: form.notes };
      if (form.id) {
        await appointmentService.update(form.id, payload);
      } else {
        await appointmentService.create(payload);
      }
      await refetch();
      showToast('Appointment saved.');
      setModal(null);
    } catch (err) {
      showToast(err.message || 'Failed to save appointment.');
    }
  };

  const handleAdvanceStatus = async (appt) => {
    const next = STATUS_META[appt.status]?.next;
    if (!next) return;
    await appointmentService.update(appt.apptId, { status: next });
    await refetch();
    showToast(`Marked as ${next}.`);
  };

  const handleCancel = async (appt) => {
    await appointmentService.update(appt.apptId, { status: 'cancelled' });
    await refetch();
    showToast('Appointment cancelled.');
    setModal(null);
  };

  const handleReschedule = async (updated) => {
    await appointmentService.update(updated.apptId, { date: updated.date, time: updated.time, status: updated.status });
    await refetch();
    showToast('Appointment rescheduled.');
    setModal(null);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayCount = allAppts.filter(a => a.date === todayStr && a.status !== 'cancelled').length;
  const pendingCount = allAppts.filter(a => a.status === 'pending').length;

  const openEdit = (appt) => setModal({
    type: 'edit',
    data: { id: appt.apptId, patientId: appt.patientId?.patientId, doctorId: appt.doctorId?.doctorId, date: appt.date, time: appt.time, type: appt.type, notes: appt.notes },
  });

  const handleWritePrescription = (appt) => {
    navigate('prescriptions', { prefillPatientId: appt.patientId?.patientId });
  };

  if (loading) {
    return (
      <div className="appts-page" aria-busy="true" aria-label="Loading…">
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
        <EmptyState icon={CalendarDays} message={error} actionLabel="Retry" onAction={refetch} />
      </div>
    );
  }

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
                <select value={filterValues.doctor} onChange={(e) => setFilter('doctor', e.target.value)} aria-label="Filter by doctor">
                  <option value="">All Doctors</option>
                  {doctors.map((d) => <option key={d.doctorId} value={d.name}>{d.name}</option>)}
                </select>
              </div>
            )}
            <div className="filter-group">
              <ChevronDown size={14} className="filter-icon" />
              <select value={filterValues.status} onChange={(e) => setFilter('status', e.target.value)} aria-label="Filter by status">
                <option value="">All Statuses</option>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div className="filter-group date-range-group">
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} aria-label="From date" />
              <span className="text-muted">to</span>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} aria-label="To date" />
            </div>
          </div>

          <div className="table-container">
            {filtered.length === 0 ? (
              <EmptyState icon={CalendarDays} message="No appointments found." actionLabel="Clear Filters" onAction={clearAll} />
            ) : (
              <table className="data-table" aria-label="Appointments list">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Date & Time</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a) => {
                    const meta = STATUS_META[a.status];
                    return (
                      <tr key={a.apptId}>
                        <td>
                          <div className="appt-patient-cell">
                            <div className="appt-avatar">{a.patientName.split(' ').map(w => w[0]).join('').slice(0,2)}</div>
                            <div>
                              <div className="cell-name">{a.patientName}</div>
                              <div className="text-muted">{a.patientId?.patientId}</div>
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
                        <td>
                          <div className="action-btns">
                            {isDoctor ? (
                              a.status === 'completed' && (
                                <button className="icon-btn icon-btn--success" title="Write prescription" onClick={() => handleWritePrescription(a)} aria-label={`Write prescription for ${a.patientName}`}><ClipboardList size={15} /></button>
                              )
                            ) : (
                              <>
                                {meta.next && (
                                  <button className="icon-btn icon-btn--success" title={`Mark as ${meta.next}`} onClick={() => handleAdvanceStatus(a)} aria-label={`Advance to ${meta.next}`}><CheckCircle2 size={15} /></button>
                                )}
                                {a.status !== 'completed' && a.status !== 'cancelled' && (
                                  <button className="icon-btn" title="Edit" onClick={() => openEdit(a)} aria-label="Edit appointment"><Plus size={15} className="icon-rotate-45" aria-hidden="true" /></button>
                                )}
                                {(a.status === 'pending' || a.status === 'confirmed') && (
                                  <button className="icon-btn icon-btn--warning" title="Reschedule" onClick={() => setModal({ type: 'reschedule', data: a })} aria-label="Reschedule appointment"><CalendarClock size={15} /></button>
                                )}
                                {(a.status === 'pending' || a.status === 'confirmed') && (
                                  <button className="icon-btn icon-btn--danger" title="Cancel" onClick={() => setModal({ type: 'cancel', data: a })} aria-label="Cancel appointment"><XCircle size={15} /></button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
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
        <BookModal appt={modal.data} appts={allAppts} patients={patients} doctors={doctors} onClose={() => setModal(null)} onSave={handleSave} />
      )}
      {modal?.type === 'reschedule' && (
        <RescheduleModal appt={modal.data} appts={allAppts} onClose={() => setModal(null)} onSave={handleReschedule} />
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
