import { useState } from 'react';
import { Search, Plus, X, FileText, Lock, User, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import EmptyState from '../components/EmptyState';
import useToast from '../hooks/useToast';
import './MedicalHistory.css';

const PATIENT_LIST = [
  { id: 'PT-1001', name: 'Ahmed Khan' },
  { id: 'PT-1002', name: 'Sara Malik' },
  { id: 'PT-1003', name: 'Hassan Raza' },
  { id: 'PT-1004', name: 'Maryam Iqbal' },
];

const INITIAL_HISTORY = {
  'PT-1001': [
    { id: 'MH-001', date: '2026-06-28', doctor: 'Dr. Fatima Noor', diagnosis: 'Hypertension', notes: 'Patient presented with mild chest tightness. ECG performed: normal sinus rhythm. Advised lifestyle changes and follow-up in 2 weeks.', timestamp: '2026-06-28T09:14:00' },
    { id: 'MH-002', date: '2026-03-10', doctor: 'Dr. Usman Ali', diagnosis: 'Chronic Lower Back Pain', notes: 'Reviewed chronic back pain. Prescribed physiotherapy sessions and muscle relaxants. Avoid heavy lifting.', timestamp: '2026-03-10T11:32:00' },
  ],
  'PT-1002': [
    { id: 'MH-003', date: '2026-07-01', doctor: 'Dr. Usman Ali', diagnosis: 'Ankle Fracture Recovery', notes: 'Post-op review of ankle fracture. Healing is on track. Cast removed. Referred to physical therapy for range of motion exercises.', timestamp: '2026-07-01T10:05:00' },
  ],
  'PT-1003': [],
  'PT-1004': [
    { id: 'MH-004', date: '2026-06-15', doctor: 'Dr. Sana Riaz', diagnosis: 'Routine Gynaecological Checkup', notes: 'Annual examination completed. All parameters within normal limits. Next checkup in 12 months.', timestamp: '2026-06-15T14:20:00' },
  ],
};

const MedicalHistory = () => {
  const { role } = useAuth();
  const isDoctor = role === 'doctor';
  const canAppend = isDoctor; // Only doctors can add entries

  const [history, setHistory] = useState(INITIAL_HISTORY);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [newEntry, setNewEntry] = useState({ diagnosis: '', notes: '' });
  const [errors, setErrors] = useState({});
  const { toast, showToast } = useToast();

  const filteredPatients = PATIENT_LIST.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase())
  );

  const selectedPatient = PATIENT_LIST.find((p) => p.id === selectedPatientId);
  const entries = selectedPatientId ? (history[selectedPatientId] || []) : [];

  const handleAddEntry = (e) => {
    e.preventDefault();
    const errs = {};
    if (!newEntry.diagnosis.trim()) errs.diagnosis = 'Diagnosis is required';
    if (!newEntry.notes.trim()) errs.notes = 'Clinical notes are required';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const entry = {
      id: `MH-${Date.now()}`,
      date: '2026-07-03',
      doctor: 'Dr. Fatima Noor', // ponytail: mock own doctor
      diagnosis: newEntry.diagnosis,
      notes: newEntry.notes,
      timestamp: new Date().toISOString(),
    };

    setHistory((prev) => ({
      ...prev,
      [selectedPatientId]: [entry, ...(prev[selectedPatientId] || [])],
    }));
    setNewEntry({ diagnosis: '', notes: '' });
    setErrors({});
    setModal(false);
    showToast('History entry appended and locked.');
  };

  return (
    <div className="mh-page">
      {/* Left panel — patient selector */}
      <aside className="mh-sidebar">
        <div className="mh-sidebar-header">
          <h3>Select Patient</h3>
        </div>
        <div className="mh-search">
          <Search size={15} />
          <input
            type="search"
            placeholder="Search patient…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search patients"
          />
        </div>
        <ul className="mh-patient-list">
          {filteredPatients.map((p) => {
            const count = (history[p.id] || []).length;
            return (
              <li key={p.id}>
                <button
                  className={`mh-patient-item ${selectedPatientId === p.id ? 'active' : ''}`}
                  onClick={() => setSelectedPatientId(p.id)}
                >
                  <div className="mh-patient-avatar">{p.name.split(' ').map(w => w[0]).join('').slice(0,2)}</div>
                  <div className="mh-patient-info">
                    <span className="mh-patient-name">{p.name}</span>
                    <span className="mh-patient-sub">{p.id} · {count} {count === 1 ? 'entry' : 'entries'}</span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* Right panel — history timeline */}
      <div className="mh-main">
        {!selectedPatient ? (
          <div className="mh-empty-state">
            <EmptyState icon={FileText} message="Select a patient to view their medical history." />
          </div>
        ) : (
          <>
            <div className="mh-main-header">
              <div>
                <h2>{selectedPatient.name}</h2>
                <p className="page-subtitle">{selectedPatient.id} · {entries.length} {entries.length === 1 ? 'entry' : 'entries'}</p>
              </div>
              {canAppend && (
                <button className="btn btn-primary" onClick={() => setModal(true)}>
                  <Plus size={16} /> Add Entry
                </button>
              )}
            </div>

            <div className="immutable-notice">
              <Lock size={13} />
              Medical history entries are <strong>audit-critical and immutable</strong>. No editing or deletion is permitted for any role.
            </div>

            {entries.length === 0 ? (
              <EmptyState icon={FileText} message="No medical history entries for this patient yet." />
            ) : (
              <div className="mh-timeline">
                {entries.map((entry) => (
                  <div key={entry.id} className="mh-entry">
                    <div className="mh-entry-dot" aria-hidden="true" />
                    <div className="mh-entry-card">
                      <div className="mh-entry-header">
                        <div className="mh-entry-meta">
                          <span className="mh-entry-diagnosis">{entry.diagnosis}</span>
                          <span className="mh-entry-id text-muted">{entry.id}</span>
                        </div>
                        <span className="mh-lock-badge" title="Immutable entry"><Lock size={12} /> Locked</span>
                      </div>
                      <p className="mh-entry-notes">{entry.notes}</p>
                      <div className="mh-entry-footer">
                        <span><User size={12} /> {entry.doctor}</span>
                        <span><Calendar size={12} /> {entry.date}</span>
                        <span className="text-muted">Recorded: {new Date(entry.timestamp).toLocaleString('en-GB')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Append Entry Modal */}
      {modal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="mh-modal-title" onClick={(e) => e.target === e.currentTarget && setModal(false)}>
          <div className="modal-box">
            <div className="modal-header">
              <h2 id="mh-modal-title">Add History Entry — {selectedPatient?.name}</h2>
              <button className="modal-close-btn" onClick={() => setModal(false)} aria-label="Close"><X size={20} /></button>
            </div>
            <form className="modal-form" onSubmit={handleAddEntry} noValidate>
              <div className="alert-banner alert-banner--warning">
                <Lock size={15} />
                This entry will be <strong>permanently locked</strong> after saving. It cannot be edited or deleted.
              </div>
              <div className={`form-field ${errors.diagnosis ? 'has-error' : ''}`}>
                <label htmlFor="mh-diag">Diagnosis / Condition *</label>
                <input id="mh-diag" value={newEntry.diagnosis} onChange={(e) => setNewEntry((n) => ({ ...n, diagnosis: e.target.value }))} placeholder="Primary diagnosis or condition" />
                {errors.diagnosis && <span className="field-error">{errors.diagnosis}</span>}
              </div>
              <div className={`form-field ${errors.notes ? 'has-error' : ''}`}>
                <label htmlFor="mh-notes">Clinical Notes *</label>
                <textarea id="mh-notes" value={newEntry.notes} onChange={(e) => setNewEntry((n) => ({ ...n, notes: e.target.value }))} placeholder="Detailed clinical observations, findings, and recommendations…" rows={5} />
                {errors.notes && <span className="field-error">{errors.notes}</span>}
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary"><Lock size={14} /> Lock & Save Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <div className="toast toast--success" role="status">{toast}</div>}
    </div>
  );
};

export default MedicalHistory;
