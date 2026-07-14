import { useState } from 'react';
import {
  CalendarX, CheckCircle2, Clock, Play,
  UserRound, FileText, ClipboardList,
  ChevronRight, RefreshCw, Stethoscope,
  X, Lock, Plus, Trash2,
} from 'lucide-react';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import useToast from '../hooks/useToast';
import { useNavigation } from '../context/NavigationContext';
import './DoctorHome.css';

/* ── Static mock data ──────────────────────────────── */
const TODAY_APPTS = [
  {
    id: 'APT-2001',
    time: '09:00', endTime: '09:30',
    patient: { id: 'PT-1001', name: 'Ahmed Khan',   age: 45, gender: 'Male',   blood: 'B+',  phone: '0300-123-4567' },
    type: 'Follow-up',    reason: 'Blood pressure & cardiac review',
    status: 'completed',
  },
  {
    id: 'APT-2002',
    time: '10:30', endTime: '11:00',
    patient: { id: 'PT-1002', name: 'Sara Malik',    age: 32, gender: 'Female', blood: 'O-',  phone: '0311-987-6543' },
    type: 'Post-Op Review', reason: 'Ankle fracture recovery check',
    status: 'in-progress',
  },
  {
    id: 'APT-2003',
    time: '11:45', endTime: '12:15',
    patient: { id: 'PT-1003', name: 'Hassan Raza',   age: 28, gender: 'Male',   blood: 'A+',  phone: '0321-555-4321' },
    type: 'Consultation', reason: 'Upper respiratory infection',
    status: 'upcoming',
  },
  {
    id: 'APT-2004',
    time: '14:00', endTime: '14:30',
    patient: { id: 'PT-1004', name: 'Maryam Iqbal',  age: 38, gender: 'Female', blood: 'AB+', phone: '0333-876-5432' },
    type: 'Annual Checkup', reason: 'Routine gynaecological examination',
    status: 'upcoming',
  },
  {
    id: 'APT-2005',
    time: '15:30', endTime: '16:00',
    patient: { id: 'PT-1005', name: 'Zaid Hussain',  age: 55, gender: 'Male',   blood: 'A-',  phone: '0345-222-3344' },
    type: 'Follow-up',    reason: 'Diabetes & hypertension management',
    status: 'upcoming',
  },
];

const STATUS_CFG = {
  upcoming:      { label: 'Upcoming',     cls: 'dh-badge--upcoming',     Icon: Clock },
  'in-progress': { label: 'In Progress',  cls: 'dh-badge--in-progress',  Icon: Play },
  completed:     { label: 'Completed',    cls: 'dh-badge--completed',    Icon: CheckCircle2 },
};

const FREQ_OPTIONS = ['Once daily', 'Twice daily', 'Three times daily', 'Every 8 hours', 'Every 12 hours', 'As needed', 'At night'];
const BLANK_MED = { name: '', dosage: '', frequency: 'Once daily' };

const getInitials = (name) =>
  name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

/* ── Quick Prescription Modal ───────────────────────── */
const QuickPrescriptionModal = ({ patient, onClose, onSave }) => {
  const [form, setForm] = useState({ diagnosis: '', notes: '', medications: [{ ...BLANK_MED }] });
  const [errors, setErrors] = useState({});

  const addMed = () => setForm(f => ({ ...f, medications: [...f.medications, { ...BLANK_MED }] }));
  const removeMed = (i) => setForm(f => ({ ...f, medications: f.medications.filter((_, idx) => idx !== i) }));
  const setMed = (i, k, v) => setForm(f => {
    const meds = [...f.medications];
    meds[i] = { ...meds[i], [k]: v };
    return { ...f, medications: meds };
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.diagnosis.trim()) errs.diagnosis = 'Diagnosis is required';
    if (form.medications.some(m => !m.name.trim())) errs.meds = 'All medicine names are required';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave(form);
  };

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qrx-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box">
        <div className="modal-header">
          <h2 id="qrx-title">New Prescription — {patient.name}</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close dialog"><X size={20} /></button>
        </div>
        <form className="modal-form" onSubmit={handleSubmit} noValidate>
          <div className={`form-field ${errors.diagnosis ? 'has-error' : ''}`}>
            <label htmlFor="qrx-diag">Diagnosis *</label>
            <input
              id="qrx-diag"
              value={form.diagnosis}
              onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))}
              placeholder="Primary diagnosis or condition"
            />
            {errors.diagnosis && <span className="field-error">{errors.diagnosis}</span>}
          </div>

          <div className="qrx-meds-section">
            <div className="qrx-meds-header">
              <span className="qrx-section-label">Medications</span>
              <button type="button" className="btn btn-ghost btn-sm" onClick={addMed}>
                <Plus size={13} aria-hidden="true" /> Add
              </button>
            </div>
            {errors.meds && <span className="field-error">{errors.meds}</span>}
            {form.medications.map((med, i) => (
              <div key={i} className="qrx-med-row">
                <div className="form-field qrx-name-field">
                  <label htmlFor={`qrx-name-${i}`}>Medicine *</label>
                  <input
                    id={`qrx-name-${i}`}
                    value={med.name}
                    onChange={e => setMed(i, 'name', e.target.value)}
                    placeholder="e.g. Paracetamol 500mg"
                  />
                </div>
                <div className="form-field qrx-freq-field">
                  <label htmlFor={`qrx-freq-${i}`}>Frequency</label>
                  <select
                    id={`qrx-freq-${i}`}
                    value={med.frequency}
                    onChange={e => setMed(i, 'frequency', e.target.value)}
                  >
                    {FREQ_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                {form.medications.length > 1 && (
                  <button
                    type="button"
                    className="icon-btn icon-btn--danger qrx-remove-btn"
                    onClick={() => removeMed(i)}
                    aria-label={`Remove medication ${i + 1}`}
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="form-field">
            <label htmlFor="qrx-notes">Additional Notes</label>
            <textarea
              id="qrx-notes"
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Additional instructions or observations…"
              rows={2}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              <ClipboardList size={14} aria-hidden="true" /> Sign & Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── Quick History Note Modal ───────────────────────── */
const QuickHistoryModal = ({ patient, onClose, onSave }) => {
  const [form, setForm] = useState({ diagnosis: '', notes: '' });
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.diagnosis.trim()) errs.diagnosis = 'Diagnosis is required';
    if (!form.notes.trim()) errs.notes = 'Clinical notes are required';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave(form);
  };

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qhist-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box">
        <div className="modal-header">
          <h2 id="qhist-title">History Note — {patient.name}</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close dialog"><X size={20} /></button>
        </div>
        <form className="modal-form" onSubmit={handleSubmit} noValidate>
          <div className="alert-banner alert-banner--warning">
            <Lock size={14} aria-hidden="true" />
            This entry is <strong>permanently locked</strong> after saving. No editing or deletion is permitted.
          </div>
          <div className={`form-field ${errors.diagnosis ? 'has-error' : ''}`}>
            <label htmlFor="qhist-diag">Diagnosis / Condition *</label>
            <input
              id="qhist-diag"
              value={form.diagnosis}
              onChange={e => setForm(f => ({ ...f, diagnosis: e.target.value }))}
              placeholder="Primary diagnosis or condition"
            />
            {errors.diagnosis && <span className="field-error">{errors.diagnosis}</span>}
          </div>
          <div className={`form-field ${errors.notes ? 'has-error' : ''}`}>
            <label htmlFor="qhist-notes">Clinical Notes *</label>
            <textarea
              id="qhist-notes"
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Observations, findings, treatment plan, and recommendations…"
              rows={5}
            />
            {errors.notes && <span className="field-error">{errors.notes}</span>}
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              <Lock size={14} aria-hidden="true" /> Lock & Save Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── Appointment Card ────────────────────────────────── */
const AppointmentCard = ({ appt, isSelected, onSelect, onStart, onComplete }) => {
  const cfg = STATUS_CFG[appt.status];
  const StatusIcon = cfg.Icon;

  return (
    <article
      className={[
        'dh-appt-card',
        `dh-appt-card--${appt.status}`,
        isSelected ? 'dh-appt-card--selected' : '',
      ].join(' ')}
      onClick={() => onSelect(appt)}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(appt)}
      tabIndex={0}
      role="button"
      aria-pressed={isSelected}
      aria-label={`${appt.time} – ${appt.patient.name}, ${appt.type}, ${cfg.label}`}
    >
      <div className="dh-appt-time-col" aria-hidden="true">
        <span className="dh-appt-time">{appt.time}</span>
        <span className="dh-appt-end-time">{appt.endTime}</span>
      </div>

      <div className="dh-appt-avatar" aria-hidden="true">
        {getInitials(appt.patient.name)}
      </div>

      <div className="dh-appt-body">
        <span className="dh-appt-patient-name">{appt.patient.name}</span>
        <span className="dh-appt-meta">{appt.type} · {appt.reason}</span>
      </div>

      <div className="dh-appt-right">
        <span className={`dh-badge ${cfg.cls}`}>
          <StatusIcon size={11} aria-hidden="true" />
          {cfg.label}
        </span>
        {appt.status === 'upcoming' && (
          <button
            className="dh-appt-action-btn dh-appt-action-btn--start"
            onClick={(e) => { e.stopPropagation(); onStart(appt); }}
            aria-label={`Start session with ${appt.patient.name}`}
          >
            <Play size={12} aria-hidden="true" /> Start
          </button>
        )}
        {appt.status === 'in-progress' && (
          <button
            className="dh-appt-action-btn dh-appt-action-btn--complete"
            onClick={(e) => { e.stopPropagation(); onComplete(appt); }}
            aria-label={`Mark ${appt.patient.name}'s appointment as completed`}
          >
            <CheckCircle2 size={12} aria-hidden="true" /> Done
          </button>
        )}
      </div>
    </article>
  );
};

/* ── Patient Panel ───────────────────────────────────── */
const PatientPanel = ({ appt, onNewPrescription, onNewHistoryNote, onGoToPatients, onGoToHistory }) => {
  const { patient } = appt;
  const cfg = STATUS_CFG[appt.status];
  const StatusIcon = cfg.Icon;

  return (
    <div className="dh-panel-card">
      <div className="dh-panel-patient-header">
        <div className="dh-panel-avatar" aria-hidden="true">
          {getInitials(patient.name)}
        </div>
        <div>
          <h3 className="dh-panel-name">{patient.name}</h3>
          <p className="dh-panel-meta">
            {patient.id} · {patient.age}{patient.gender[0]} · Blood {patient.blood}
          </p>
          <p className="dh-panel-phone">{patient.phone}</p>
        </div>
      </div>

      <div className="dh-panel-section">
        <p className="dh-panel-section-title">Current Appointment</p>
        <div className="dh-panel-detail-row">
          <Clock size={13} aria-hidden="true" />
          <span>{appt.time} – {appt.endTime}</span>
        </div>
        <div className="dh-panel-detail-row">
          <Stethoscope size={13} aria-hidden="true" />
          <span>{appt.type}</span>
        </div>
        <p className="dh-panel-reason">{appt.reason}</p>
        <span className={`dh-badge ${cfg.cls}`}>
          <StatusIcon size={11} aria-hidden="true" /> {cfg.label}
        </span>
      </div>

      <div className="dh-panel-section">
        <p className="dh-panel-section-title">Quick Actions</p>
        <button className="dh-quick-btn dh-quick-btn--primary" onClick={onNewPrescription}>
          <ClipboardList size={16} aria-hidden="true" />
          <span>New Prescription</span>
        </button>
        <button className="dh-quick-btn dh-quick-btn--secondary" onClick={onNewHistoryNote}>
          <FileText size={16} aria-hidden="true" />
          <span>Add History Note</span>
        </button>
      </div>

      <div className="dh-panel-links">
        <button className="dh-nav-link" onClick={onGoToPatients}>
          <UserRound size={14} aria-hidden="true" />
          <span>Patient Record</span>
          <ChevronRight size={14} aria-hidden="true" />
        </button>
        <button className="dh-nav-link" onClick={onGoToHistory}>
          <FileText size={14} aria-hidden="true" />
          <span>Medical History</span>
          <ChevronRight size={14} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

/* ── DoctorHome (main component) ─────────────────────── */
const DoctorHome = () => {
  const { navigate } = useNavigation();
  const { toast, showToast } = useToast();

  const [appointments, setAppointments] = useState(TODAY_APPTS);
  const [selected, setSelected] = useState(
    () => TODAY_APPTS.find(a => a.status === 'in-progress') ?? null
  );
  const [viewState, setViewState] = useState('loaded');
  const [modal, setModal] = useState(null); // { type: 'rx'|'history', patient }

  const loading = viewState === 'loading';
  const displayAppts = viewState === 'empty' ? [] : appointments;

  const completedCount  = appointments.filter(a => a.status === 'completed').length;
  const inProgressCount = appointments.filter(a => a.status === 'in-progress').length;
  const upcomingCount   = appointments.filter(a => a.status === 'upcoming').length;

  const handleStart = (appt) => {
    setAppointments(prev => prev.map(a =>
      a.id === appt.id
        ? { ...a, status: 'in-progress' }
        : a.status === 'in-progress' ? { ...a, status: 'upcoming' } : a
    ));
    setSelected({ ...appt, status: 'in-progress' });
    showToast(`Session started with ${appt.patient.name}.`);
  };

  const handleComplete = (appt) => {
    setAppointments(prev => prev.map(a =>
      a.id === appt.id ? { ...a, status: 'completed' } : a
    ));
    setSelected(prev => prev?.id === appt.id ? { ...prev, status: 'completed' } : prev);
    showToast(`Appointment with ${appt.patient.name} marked as completed.`);
  };

  const handleSavePrescription = (form) => {
    showToast(`Prescription signed and saved for ${modal?.patient?.name}.`);
    setModal(null);
  };

  const handleSaveHistory = (form) => {
    showToast(`History entry locked and saved for ${modal?.patient?.name}.`);
    setModal(null);
  };

  const handleRefresh = () => {
    setViewState('loading');
    setTimeout(() => setViewState('loaded'), 900);
  };

  return (
    <div className="doctor-home">

      {/* ── Top toolbar ──────────────────────────────── */}
      <div className="dh-topbar" role="toolbar" aria-label="Schedule controls">
        <div className="dh-topbar-info">
          <h2>Today's Schedule</h2>
          <p className="page-subtitle">Thursday, 3 July 2026 · Dr. Fatima Noor</p>
        </div>

        <div className="dh-summary-chips" aria-label="Appointment summary">
          <span className="dh-chip dh-chip--success">
            <CheckCircle2 size={13} aria-hidden="true" />
            {completedCount} Done
          </span>
          <span className="dh-chip dh-chip--warning">
            <Play size={13} aria-hidden="true" />
            {inProgressCount} In Progress
          </span>
          <span className="dh-chip dh-chip--neutral">
            <Clock size={13} aria-hidden="true" />
            {upcomingCount} Upcoming
          </span>
        </div>

        <div className="dh-topbar-controls">
          <label htmlFor="dh-state" className="sr-only">Choose view state</label>
          <select
            id="dh-state"
            className="state-dropdown"
            value={viewState}
            onChange={(e) => setViewState(e.target.value)}
          >
            <option value="loaded">State: Real Data</option>
            <option value="loading">State: Loading</option>
            <option value="empty">State: Empty</option>
          </select>
          <button
            className="refresh-btn"
            onClick={handleRefresh}
            aria-label="Refresh schedule"
          >
            <RefreshCw size={15} aria-hidden="true" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ── Main two-column grid ──────────────────────── */}
      <div className="dh-grid">

        {/* ── Left: Appointment queue ──────────────────── */}
        <section className="dh-queue-panel" aria-label="Today's appointment queue">
          <div className="dh-queue-header">
            <h3>Appointment Queue</h3>
            {!loading && (
              <span className="dh-queue-count">
                {displayAppts.length} appointment{displayAppts.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {loading ? (
            <div className="dh-skeleton-list" aria-busy="true" aria-label="Loading appointments">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="dh-skeleton-card">
                  <LoadingSkeleton variant="circle" width="40px" height="40px" />
                  <div className="dh-skeleton-lines">
                    <LoadingSkeleton variant="text" width="140px" />
                    <LoadingSkeleton variant="text" width="200px" />
                  </div>
                  <LoadingSkeleton variant="text" width="70px" />
                </div>
              ))}
            </div>
          ) : displayAppts.length === 0 ? (
            <div className="dh-empty-queue">
              <EmptyState
                icon={CalendarX}
                message="No appointments scheduled for today."
              />
            </div>
          ) : (
            <ul className="dh-appt-list" role="list" aria-label="Appointment list">
              {displayAppts.map(appt => (
                <li key={appt.id}>
                  <AppointmentCard
                    appt={appt}
                    isSelected={selected?.id === appt.id}
                    onSelect={setSelected}
                    onStart={handleStart}
                    onComplete={handleComplete}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ── Right: Patient panel ─────────────────────── */}
        <aside
          className="dh-panel-section"
          aria-label="Selected patient details and quick actions"
          aria-live="polite"
        >
          {!loading && selected ? (
            <PatientPanel
              appt={selected}
              onNewPrescription={() => setModal({ type: 'rx', patient: selected.patient })}
              onNewHistoryNote={() => setModal({ type: 'history', patient: selected.patient })}
              onGoToPatients={() => navigate('patients')}
              onGoToHistory={() => navigate('medical-history')}
            />
          ) : (
            <div className="dh-panel-placeholder">
              <div className="dh-panel-placeholder-inner">
                <div className="dh-placeholder-icon" aria-hidden="true">
                  <UserRound size={32} />
                </div>
                <p className="dh-placeholder-text">
                  Select an appointment from the queue to view patient details and quick actions.
                </p>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* ── Modals ───────────────────────────────────────── */}
      {modal?.type === 'rx' && (
        <QuickPrescriptionModal
          patient={modal.patient}
          onClose={() => setModal(null)}
          onSave={handleSavePrescription}
        />
      )}
      {modal?.type === 'history' && (
        <QuickHistoryModal
          patient={modal.patient}
          onClose={() => setModal(null)}
          onSave={handleSaveHistory}
        />
      )}

      {toast && <div className="toast toast--success" role="status">{toast}</div>}
    </div>
  );
};

export default DoctorHome;
