import { useState } from 'react';
import {
  UserCheck, Clock, Timer, Activity, CheckCircle2,
  UserPlus, CalendarPlus, CalendarX,
  RefreshCw, ChevronDown, Search, X, LogIn,
  ChevronRight, Users, Calendar, Stethoscope,
} from 'lucide-react';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import useToast from '../hooks/useToast';
import { useNavigation } from '../context/NavigationContext';
import './ReceptionistHome.css';

/* ── Static mock data ──────────────────────────────── */
const INITIAL_QUEUE = [
  { id: 'APT-3001', time: '09:00', patient: { id: 'PT-1001', name: 'Ahmed Khan'    }, doctor: { id: 'DR-001', name: 'Dr. Fatima Noor', specialty: 'Cardiology'        }, type: 'Follow-up',      status: 'completed',  checkedInAt: '08:52' },
  { id: 'APT-3002', time: '09:30', patient: { id: 'PT-1002', name: 'Sara Malik'     }, doctor: { id: 'DR-002', name: 'Dr. Usman Ali',   specialty: 'Orthopedics'       }, type: 'Post-Op Review', status: 'in-progress', checkedInAt: '09:22' },
  { id: 'APT-3003', time: '10:15', patient: { id: 'PT-1003', name: 'Hassan Raza'    }, doctor: { id: 'DR-001', name: 'Dr. Fatima Noor', specialty: 'Cardiology'        }, type: 'Consultation',   status: 'waiting',    checkedInAt: '10:05' },
  { id: 'APT-3004', time: '11:00', patient: { id: 'PT-1004', name: 'Maryam Iqbal'   }, doctor: { id: 'DR-003', name: 'Dr. Sana Riaz',   specialty: 'Gynaecology'       }, type: 'Annual Checkup', status: 'checked-in', checkedInAt: '10:48' },
  { id: 'APT-3005', time: '11:30', patient: { id: 'PT-1005', name: 'Zaid Hussain'   }, doctor: { id: 'DR-002', name: 'Dr. Usman Ali',   specialty: 'Orthopedics'       }, type: 'Follow-up',      status: 'upcoming',   checkedInAt: null    },
  { id: 'APT-3006', time: '14:00', patient: { id: 'PT-1006', name: 'Fatima Shah'    }, doctor: { id: 'DR-001', name: 'Dr. Fatima Noor', specialty: 'Cardiology'        }, type: 'Consultation',   status: 'upcoming',   checkedInAt: null    },
  { id: 'APT-3007', time: '14:45', patient: { id: 'PT-1007', name: 'Tariq Mehmood'  }, doctor: { id: 'DR-003', name: 'Dr. Sana Riaz',   specialty: 'Gynaecology'       }, type: 'New Patient',    status: 'upcoming',   checkedInAt: null    },
  { id: 'APT-3008', time: '15:30', patient: { id: 'PT-1008', name: 'Aisha Butt'     }, doctor: { id: 'DR-002', name: 'Dr. Usman Ali',   specialty: 'Orthopedics'       }, type: 'Follow-up',      status: 'upcoming',   checkedInAt: null    },
];

const DOCTOR_ROSTER = [
  { id: 'DR-001', name: 'Dr. Fatima Noor', specialty: 'Cardiology',        status: 'on-duty',  appts: 3 },
  { id: 'DR-002', name: 'Dr. Usman Ali',   specialty: 'Orthopedics',       status: 'on-duty',  appts: 3 },
  { id: 'DR-003', name: 'Dr. Sana Riaz',   specialty: 'Gynaecology',       status: 'on-duty',  appts: 2 },
  { id: 'DR-004', name: 'Dr. Khalid Mir',  specialty: 'Internal Medicine',  status: 'off-duty', appts: 0 },
];

const PATIENTS_LIST = [
  'Ahmed Khan (PT-1001)', 'Sara Malik (PT-1002)', 'Hassan Raza (PT-1003)',
  'Maryam Iqbal (PT-1004)', 'Zaid Hussain (PT-1005)',
];
const DOCTORS_LIST  = ['Dr. Fatima Noor (Cardiology)', 'Dr. Usman Ali (Orthopedics)', 'Dr. Sana Riaz (Gynaecology)'];
const APPT_TYPES    = ['Consultation', 'Follow-up', 'New Patient', 'Annual Checkup', 'Post-Op Review', 'Emergency'];

const TIME_SLOTS = ['09:00','09:30','10:00','10:30','11:00','11:30',
                    '12:00','14:00','14:30','15:00','15:30','16:00'];

/* ── Status config (icon + text — never color alone) ─ */
const STATUS_CFG = {
  upcoming:      { label: 'Upcoming',    Icon: Clock,         cls: 'rh-badge--upcoming'    },
  'checked-in':  { label: 'Checked In',  Icon: UserCheck,     cls: 'rh-badge--checked-in'  },
  waiting:       { label: 'Waiting',     Icon: Timer,         cls: 'rh-badge--waiting'     },
  'in-progress': { label: 'In Progress', Icon: Activity,      cls: 'rh-badge--in-progress' },
  completed:     { label: 'Completed',   Icon: CheckCircle2,  cls: 'rh-badge--completed'   },
};

const getInitials = (name) =>
  name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

const nowHHMM = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
};

/* ── Quick Register Modal ────────────────────────────── */
const QuickRegisterModal = ({ onClose, onSave }) => {
  const [form, setForm] = useState({ name: '', dob: '', gender: '', phone: '', cnic: '' });
  const [errors, setErrors] = useState({});

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.dob)         errs.dob  = 'Date of birth is required';
    if (!form.gender)      errs.gender = 'Gender is required';
    if (!form.phone.trim()) errs.phone = 'Phone number is required';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave(form);
  };

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qreg-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box">
        <div className="modal-header">
          <h2 id="qreg-title">Register New Patient</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close dialog"><X size={20} /></button>
        </div>
        <form className="modal-form" onSubmit={handleSubmit} noValidate>
          <div className={`form-field ${errors.name ? 'has-error' : ''}`}>
            <label htmlFor="qreg-name">Full Name *</label>
            <input id="qreg-name" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Ahmed Khan" />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          <div className="form-row">
            <div className={`form-field ${errors.dob ? 'has-error' : ''}`}>
              <label htmlFor="qreg-dob">Date of Birth *</label>
              <input id="qreg-dob" type="date" value={form.dob} onChange={e => set('dob', e.target.value)} />
              {errors.dob && <span className="field-error">{errors.dob}</span>}
            </div>
            <div className={`form-field ${errors.gender ? 'has-error' : ''}`}>
              <label htmlFor="qreg-gender">Gender *</label>
              <select id="qreg-gender" value={form.gender} onChange={e => set('gender', e.target.value)}>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other / Prefer not to say</option>
              </select>
              {errors.gender && <span className="field-error">{errors.gender}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className={`form-field ${errors.phone ? 'has-error' : ''}`}>
              <label htmlFor="qreg-phone">Phone Number *</label>
              <input id="qreg-phone" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="0300-123-4567" />
              {errors.phone && <span className="field-error">{errors.phone}</span>}
            </div>
            <div className="form-field">
              <label htmlFor="qreg-cnic">CNIC</label>
              <input id="qreg-cnic" value={form.cnic} onChange={e => set('cnic', e.target.value)} placeholder="35201-1234567-1" />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              <UserPlus size={15} aria-hidden="true" /> Register Patient
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── Quick Book Modal ─────────────────────────────────── */
const QuickBookModal = ({ onClose, onSave }) => {
  const [form, setForm] = useState({ patient: '', doctor: '', date: '2026-07-03', time: '', type: '', reason: '' });
  const [errors, setErrors] = useState({});

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.patient) errs.patient = 'Patient is required';
    if (!form.doctor)  errs.doctor  = 'Doctor is required';
    if (!form.time)    errs.time    = 'Time slot is required';
    if (!form.type)    errs.type    = 'Appointment type is required';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave(form);
  };

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qbook-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box modal-box--lg">
        <div className="modal-header">
          <h2 id="qbook-title">Book Appointment</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close dialog"><X size={20} /></button>
        </div>
        <form className="modal-form" onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <div className={`form-field ${errors.patient ? 'has-error' : ''}`}>
              <label htmlFor="qbook-patient">Patient *</label>
              <select id="qbook-patient" value={form.patient} onChange={e => set('patient', e.target.value)}>
                <option value="">Select patient</option>
                {PATIENTS_LIST.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              {errors.patient && <span className="field-error">{errors.patient}</span>}
            </div>
            <div className={`form-field ${errors.doctor ? 'has-error' : ''}`}>
              <label htmlFor="qbook-doctor">Doctor *</label>
              <select id="qbook-doctor" value={form.doctor} onChange={e => set('doctor', e.target.value)}>
                <option value="">Select doctor</option>
                {DOCTORS_LIST.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              {errors.doctor && <span className="field-error">{errors.doctor}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="qbook-date">Date *</label>
              <input id="qbook-date" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
            </div>
            <div className={`form-field ${errors.time ? 'has-error' : ''}`}>
              <label htmlFor="qbook-time">Time Slot *</label>
              <select id="qbook-time" value={form.time} onChange={e => set('time', e.target.value)}>
                <option value="">Select time</option>
                {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.time && <span className="field-error">{errors.time}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className={`form-field ${errors.type ? 'has-error' : ''}`}>
              <label htmlFor="qbook-type">Appointment Type *</label>
              <select id="qbook-type" value={form.type} onChange={e => set('type', e.target.value)}>
                <option value="">Select type</option>
                {APPT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.type && <span className="field-error">{errors.type}</span>}
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="qbook-reason">Reason for Visit</label>
            <input id="qbook-reason" value={form.reason} onChange={e => set('reason', e.target.value)} placeholder="Brief description of the patient's concern" />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              <CalendarPlus size={15} aria-hidden="true" /> Book Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── Doctor roster card ───────────────────────────────── */
const DoctorCard = ({ doctor }) => {
  const isOnDuty = doctor.status === 'on-duty';
  return (
    <div
      className={`rh-doctor-card ${isOnDuty ? '' : 'rh-doctor-card--off'}`}
      aria-label={`${doctor.name}, ${doctor.specialty}, ${isOnDuty ? `on duty, ${doctor.appts} appointments` : 'off duty'}`}
    >
      <div className="rh-doctor-avatar" aria-hidden="true">
        {getInitials(doctor.name)}
      </div>
      <div className="rh-doctor-info">
        <span className="rh-doctor-name">{doctor.name}</span>
        <span className="rh-doctor-specialty">{doctor.specialty}</span>
        <span className={`rh-duty-badge ${isOnDuty ? 'rh-duty-badge--on' : 'rh-duty-badge--off'}`}>
          <span className="rh-duty-dot" aria-hidden="true" />
          {isOnDuty ? `On Duty · ${doctor.appts} appt${doctor.appts !== 1 ? 's' : ''}` : 'Off Duty'}
        </span>
      </div>
    </div>
  );
};

/* ── ReceptionistHome ─────────────────────────────────── */
const ReceptionistHome = () => {
  const { navigate } = useNavigation();
  const { toast, showToast } = useToast();

  const [queue, setQueue] = useState(INITIAL_QUEUE);
  const [viewState, setViewState] = useState('loaded');
  const [modal, setModal] = useState(null);  // { type: 'register'|'book' }
  const [search, setSearch] = useState('');
  const [filterDoctor, setFilterDoctor] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const loading   = viewState === 'loading';
  const isEmpty   = viewState === 'empty';
  const baseQueue = isEmpty ? [] : queue;

  /* Filter */
  const filtered = baseQueue.filter(appt => {
    const q = search.toLowerCase();
    const matchesSearch = !q ||
      appt.patient.name.toLowerCase().includes(q) ||
      appt.id.toLowerCase().includes(q);
    const matchesDoctor = !filterDoctor || appt.doctor.id === filterDoctor;
    const matchesStatus = !filterStatus || appt.status === filterStatus;
    return matchesSearch && matchesDoctor && matchesStatus;
  });

  /* Summary counts */
  const done       = queue.filter(a => a.status === 'completed').length;
  const active     = queue.filter(a => a.status === 'in-progress').length;
  const inQueue    = queue.filter(a => a.status === 'checked-in' || a.status === 'waiting').length;
  const upcoming   = queue.filter(a => a.status === 'upcoming').length;
  const onDutyCount = DOCTOR_ROSTER.filter(d => d.status === 'on-duty').length;

  /* Actions */
  const handleCheckIn = (appt) => {
    const t = nowHHMM();
    setQueue(prev => prev.map(a =>
      a.id === appt.id ? { ...a, status: 'checked-in', checkedInAt: t } : a
    ));
    showToast(`${appt.patient.name} checked in at ${t}.`);
  };

  const handleMarkWaiting = (appt) => {
    setQueue(prev => prev.map(a =>
      a.id === appt.id ? { ...a, status: 'waiting' } : a
    ));
    showToast(`${appt.patient.name} moved to waiting.`);
  };

  const handleRegister = (form) => {
    showToast(`Patient "${form.name}" registered successfully.`);
    setModal(null);
  };

  const handleBook = (form) => {
    showToast('Appointment booked successfully.');
    setModal(null);
  };

  const handleRefresh = () => {
    setViewState('loading');
    setTimeout(() => setViewState('loaded'), 900);
  };

  const clearFilters = () => { setSearch(''); setFilterDoctor(''); setFilterStatus(''); };
  const hasFilters   = search || filterDoctor || filterStatus;

  return (
    <div className="receptionist-home">

      {/* ── Top toolbar ───────────────────────────────── */}
      <div className="rh-topbar" role="toolbar" aria-label="Queue controls">
        <div className="rh-topbar-info">
          <h2>Today's Queue</h2>
          <p className="page-subtitle">
            Thursday, 3 July 2026 · {queue.length} appointments · {onDutyCount} doctors on duty
          </p>
        </div>

        <div className="rh-summary-chips" aria-label="Appointment summary">
          <span className="rh-chip rh-chip--success">
            <CheckCircle2 size={12} aria-hidden="true" />
            {done} Done
          </span>
          <span className="rh-chip rh-chip--warning">
            <Activity size={12} aria-hidden="true" />
            {active} Active
          </span>
          <span className="rh-chip rh-chip--info">
            <Timer size={12} aria-hidden="true" />
            {inQueue} In Queue
          </span>
          <span className="rh-chip rh-chip--neutral">
            <Clock size={12} aria-hidden="true" />
            {upcoming} Upcoming
          </span>
        </div>

        <div className="rh-topbar-controls">
          <label htmlFor="rh-state" className="sr-only">Choose view state</label>
          <select
            id="rh-state"
            className="state-dropdown"
            value={viewState}
            onChange={(e) => setViewState(e.target.value)}
          >
            <option value="loaded">State: Real Data</option>
            <option value="loading">State: Loading</option>
            <option value="empty">State: Empty</option>
          </select>
          <button className="refresh-btn" onClick={handleRefresh} aria-label="Refresh queue">
            <RefreshCw size={15} aria-hidden="true" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ── Main grid ─────────────────────────────────── */}
      <div className="rh-main-grid">

        {/* ── Queue column (left) ───────────────────────── */}
        <div className="rh-queue-col">

          {/* Filter bar */}
          <div className="rh-filter-bar">
            <div className="search-box">
              <Search size={15} aria-hidden="true" />
              <input
                type="search"
                placeholder="Search patient or appointment ID…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search appointments"
              />
            </div>

            <div className="filter-group">
              <ChevronDown size={13} className="filter-icon" aria-hidden="true" />
              <select
                value={filterDoctor}
                onChange={(e) => setFilterDoctor(e.target.value)}
                aria-label="Filter by doctor"
              >
                <option value="">All Doctors</option>
                {DOCTOR_ROSTER.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <ChevronDown size={13} className="filter-icon" aria-hidden="true" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                aria-label="Filter by status"
              >
                <option value="">All Statuses</option>
                <option value="upcoming">Upcoming</option>
                <option value="checked-in">Checked In</option>
                <option value="waiting">Waiting</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {hasFilters && (
              <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
                Clear
              </button>
            )}
          </div>

          {/* Queue table */}
          <div className="rh-table-card">
            {loading ? (
              <div className="rh-skeleton-list" aria-busy="true" aria-label="Loading appointments">
                {[1,2,3,4,5].map(n => (
                  <div key={n} className="rh-skeleton-row">
                    <LoadingSkeleton variant="text" width="50px" />
                    <LoadingSkeleton variant="text" width="130px" />
                    <LoadingSkeleton variant="text" width="140px" />
                    <LoadingSkeleton variant="text" width="90px" />
                    <LoadingSkeleton variant="text" width="80px" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="rh-empty-queue">
                <EmptyState
                  icon={CalendarX}
                  message={hasFilters ? 'No appointments match your filters.' : 'No appointments booked for today.'}
                  actionLabel={hasFilters ? 'Clear Filters' : undefined}
                  onAction={hasFilters ? clearFilters : undefined}
                />
              </div>
            ) : (
              <table className="data-table" aria-label="Today's appointment queue">
                <thead>
                  <tr>
                    <th scope="col">Time</th>
                    <th scope="col">Patient</th>
                    <th scope="col">Doctor</th>
                    <th scope="col">Type</th>
                    <th scope="col">Status</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((appt) => {
                    const cfg = STATUS_CFG[appt.status] ?? STATUS_CFG.upcoming;
                    const StatusIcon = cfg.Icon;
                    const isCompleted = appt.status === 'completed';

                    return (
                      <tr
                        key={appt.id}
                        className={[
                          isCompleted ? 'rh-row--completed' : '',
                          appt.status === 'in-progress' ? 'rh-row--active' : '',
                        ].join(' ')}
                      >
                        <td>
                          <span className="rh-time">{appt.time}</span>
                        </td>
                        <td>
                          <div className="rh-patient-cell">
                            <span className="rh-patient-avatar" aria-hidden="true">
                              {getInitials(appt.patient.name)}
                            </span>
                            <div>
                              <span className="cell-bold">{appt.patient.name}</span>
                              <span className="rh-patient-id text-muted">{appt.patient.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="text-secondary">{appt.doctor.name}</td>
                        <td className="text-secondary">{appt.type}</td>
                        <td>
                          <div className="rh-status-cell">
                            <span
                              className={`rh-badge ${cfg.cls}`}
                              aria-label={`Status: ${cfg.label}`}
                            >
                              <StatusIcon size={11} aria-hidden="true" />
                              {cfg.label}
                            </span>
                            {appt.checkedInAt && (
                              <span className="rh-checked-time">
                                · {appt.checkedInAt}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          {appt.status === 'upcoming' && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleCheckIn(appt)}
                              aria-label={`Check in ${appt.patient.name}`}
                            >
                              <LogIn size={13} aria-hidden="true" /> Check In
                            </button>
                          )}
                          {appt.status === 'checked-in' && (
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => handleMarkWaiting(appt)}
                              aria-label={`Mark ${appt.patient.name} as waiting`}
                            >
                              <Timer size={13} aria-hidden="true" /> Mark Waiting
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {!loading && filtered.length > 0 && (
              <p className="rh-table-footer">
                Showing {filtered.length} of {baseQueue.length} appointment{baseQueue.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>

        {/* ── Side panel (right) ────────────────────────── */}
        <aside className="rh-side-panel" aria-label="Quick actions and doctor availability">

          {/* Quick Actions */}
          <div className="rh-panel-card">
            <div className="rh-panel-header">
              <h3>Quick Actions</h3>
            </div>
            <div className="rh-panel-body">
              <button
                className="rh-quick-btn rh-quick-btn--primary"
                onClick={() => setModal({ type: 'register' })}
                aria-label="Open register new patient form"
              >
                <div className="rh-quick-icon" aria-hidden="true">
                  <UserPlus size={18} />
                </div>
                <div className="rh-quick-text">
                  <span className="rh-quick-label">Register Patient</span>
                  <span className="rh-quick-desc">Add a new patient record</span>
                </div>
              </button>

              <button
                className="rh-quick-btn rh-quick-btn--secondary"
                onClick={() => setModal({ type: 'book' })}
                aria-label="Open book appointment form"
              >
                <div className="rh-quick-icon" aria-hidden="true">
                  <CalendarPlus size={18} />
                </div>
                <div className="rh-quick-text">
                  <span className="rh-quick-label">Book Appointment</span>
                  <span className="rh-quick-desc">Schedule for an existing patient</span>
                </div>
              </button>
            </div>
            <div className="rh-panel-links">
              <button className="rh-nav-link" onClick={() => navigate('patients')}>
                <Users size={14} aria-hidden="true" />
                <span>Patient Records</span>
                <ChevronRight size={13} aria-hidden="true" />
              </button>
              <button className="rh-nav-link" onClick={() => navigate('appointments')}>
                <Calendar size={14} aria-hidden="true" />
                <span>Full Schedule</span>
                <ChevronRight size={13} aria-hidden="true" />
              </button>
              <button className="rh-nav-link" onClick={() => navigate('doctors')}>
                <Stethoscope size={14} aria-hidden="true" />
                <span>Doctor Roster</span>
                <ChevronRight size={13} aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Doctor Availability */}
          <div className="rh-panel-card" aria-label="Doctor availability today">
            <div className="rh-panel-header">
              <h3>Doctor Availability</h3>
              <span className="rh-panel-subtitle">Today · Read-only</span>
            </div>
            <div className="rh-panel-body rh-panel-body--gap">
              {DOCTOR_ROSTER.map(doctor => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </div>
          </div>

        </aside>
      </div>

      {/* ── Modals ──────────────────────────────────────── */}
      {modal?.type === 'register' && (
        <QuickRegisterModal onClose={() => setModal(null)} onSave={handleRegister} />
      )}
      {modal?.type === 'book' && (
        <QuickBookModal onClose={() => setModal(null)} onSave={handleBook} />
      )}

      {toast && <div className="toast toast--success" role="status">{toast}</div>}
    </div>
  );
};

export default ReceptionistHome;
