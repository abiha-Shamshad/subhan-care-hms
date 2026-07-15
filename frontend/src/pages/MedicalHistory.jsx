import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, X, FileText, Lock, User, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import useToast from '../hooks/useToast';
import useApiResource from '../hooks/useApiResource';
import { patientService, medicalHistoryService } from '../services/api';
import './MedicalHistory.css';

const MedicalHistory = () => {
  const { role } = useAuth();
  const canAppend = role === 'doctor'; // Only doctors can add entries

  const { data: patientData, loading: patientsLoading, error: patientsError, refetch: refetchPatients } = useApiResource(() => patientService.getAll());
  const patients = patientData || [];

  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [newEntry, setNewEntry] = useState({ diagnosis: '', notes: '' });
  const [errors, setErrors] = useState({});
  const { toast, showToast } = useToast();

  const [entries, setEntries] = useState([]);
  const [entriesLoading, setEntriesLoading] = useState(false);

  const loadEntries = useCallback(async (patientId) => {
    if (!patientId) return;
    setEntriesLoading(true);
    try {
      const data = await medicalHistoryService.getByPatient(patientId);
      setEntries(data);
    } catch {
      setEntries([]);
    } finally {
      setEntriesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEntries(selectedPatientId);
  }, [selectedPatientId, loadEntries]);

  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.patientId.toLowerCase().includes(search.toLowerCase())
  );

  const selectedPatient = patients.find((p) => p.patientId === selectedPatientId);

  const handleAddEntry = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!newEntry.diagnosis.trim()) errs.diagnosis = 'Diagnosis is required';
    if (!newEntry.notes.trim()) errs.notes = 'Clinical notes are required';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    try {
      await medicalHistoryService.create(selectedPatientId, newEntry);
      await loadEntries(selectedPatientId);
      setNewEntry({ diagnosis: '', notes: '' });
      setErrors({});
      setModal(false);
      showToast('History entry appended and locked.');
    } catch (err) {
      showToast(err.message || 'Failed to save entry.');
    }
  };

  if (patientsLoading) {
    return (
      <div className="mh-page" aria-busy="true" aria-label="Loading…">
        {[1, 2, 3].map(n => (
          <div key={n} className="skeleton-row">
            <LoadingSkeleton variant="text" width="120px" />
            <LoadingSkeleton variant="text" width="200px" />
          </div>
        ))}
      </div>
    );
  }

  if (patientsError) {
    return (
      <div className="page-centered">
        <EmptyState icon={FileText} message={patientsError} actionLabel="Retry" onAction={refetchPatients} />
      </div>
    );
  }

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
          {filteredPatients.map((p) => (
            <li key={p.patientId}>
              <button
                className={`mh-patient-item ${selectedPatientId === p.patientId ? 'active' : ''}`}
                onClick={() => setSelectedPatientId(p.patientId)}
              >
                <div className="mh-patient-avatar">{p.name.split(' ').map(w => w[0]).join('').slice(0,2)}</div>
                <div className="mh-patient-info">
                  <span className="mh-patient-name">{p.name}</span>
                  <span className="mh-patient-sub">{p.patientId}</span>
                </div>
              </button>
            </li>
          ))}
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
                <p className="page-subtitle">{selectedPatient.patientId} · {entries.length} {entries.length === 1 ? 'entry' : 'entries'}</p>
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

            {entriesLoading ? (
              <div aria-busy="true" aria-label="Loading…">
                {[1, 2].map(n => <LoadingSkeleton key={n} variant="text" width="100%" />)}
              </div>
            ) : entries.length === 0 ? (
              <EmptyState icon={FileText} message="No medical history entries for this patient yet." />
            ) : (
              <div className="mh-timeline">
                {entries.map((entry) => (
                  <div key={entry.entryId} className="mh-entry">
                    <div className="mh-entry-dot" aria-hidden="true" />
                    <div className="mh-entry-card">
                      <div className="mh-entry-header">
                        <div className="mh-entry-meta">
                          <span className="mh-entry-diagnosis">{entry.diagnosis}</span>
                          <span className="mh-entry-id text-muted">{entry.entryId}</span>
                        </div>
                        <span className="mh-lock-badge" title="Immutable entry"><Lock size={12} /> Locked</span>
                      </div>
                      <p className="mh-entry-notes">{entry.notes}</p>
                      <div className="mh-entry-footer">
                        <span><User size={12} /> {entry.doctor}</span>
                        <span><Calendar size={12} /> {new Date(entry.date).toLocaleDateString('en-CA')}</span>
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
