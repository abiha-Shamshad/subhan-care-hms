import { useState } from 'react';
import { Plus, Search, ChevronDown, X, Trash2, ClipboardList, CheckCircle2, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';
import useToast from '../hooks/useToast';
import './Prescriptions.css';

const PATIENTS = ['Ahmed Khan (PT-1001)', 'Sara Malik (PT-1002)', 'Hassan Raza (PT-1003)', 'Maryam Iqbal (PT-1004)'];
const FREQUENCIES = ['Once daily', 'Twice daily', 'Three times daily', 'Four times daily', 'Every 8 hours', 'Every 12 hours', 'As needed', 'At night'];
const DURATIONS = ['3 days', '5 days', '7 days', '10 days', '14 days', '1 month', '3 months', 'Ongoing'];

const BLANK_MED = { name: '', dosage: '', frequency: '', duration: '', instructions: '' };

const INITIAL_RX = [
  {
    id: 'RX-001',
    patient: 'Ahmed Khan (PT-1001)',
    doctor: 'Dr. Fatima Noor',
    date: '2026-06-28',
    diagnosis: 'Hypertension, Hyperlipidaemia',
    medications: [
      { name: 'Aspirin', dosage: '75mg', frequency: 'Once daily', duration: 'Ongoing', instructions: 'Take after meal' },
      { name: 'Atorvastatin', dosage: '10mg', frequency: 'At night', duration: 'Ongoing', instructions: 'Avoid grapefruit' },
    ],
    notes: 'Monitor BP weekly',
    status: 'dispensed',
  },
  {
    id: 'RX-002',
    patient: 'Sara Malik (PT-1002)',
    doctor: 'Dr. Usman Ali',
    date: '2026-07-01',
    diagnosis: 'Post-operative pain management',
    medications: [
      { name: 'Ibuprofen', dosage: '400mg', frequency: 'Twice daily', duration: '7 days', instructions: 'Take with food' },
    ],
    notes: '',
    status: 'dispensed',
  },
  {
    id: 'RX-003',
    patient: 'Hassan Raza (PT-1003)',
    doctor: 'Dr. Fatima Noor',
    date: '2026-07-03',
    diagnosis: 'Viral upper respiratory infection',
    medications: [
      { name: 'Paracetamol', dosage: '500mg', frequency: 'Three times daily', duration: '5 days', instructions: 'Avoid alcohol' },
      { name: 'Chlorpheniramine', dosage: '4mg', frequency: 'Twice daily', duration: '5 days', instructions: 'May cause drowsiness' },
    ],
    notes: 'Rest advised, hydrate well',
    status: 'pending',
  },
];

const BLANK_RX = { patient: '', diagnosis: '', notes: '', medications: [{ ...BLANK_MED }] };

const validate = (form) => {
  const e = {};
  if (!form.patient) e.patient = 'Patient is required';
  if (!form.diagnosis.trim()) e.diagnosis = 'Diagnosis is required';
  if (form.medications.length === 0) e.medications = 'At least one medication is required';
  form.medications.forEach((m, i) => {
    if (!m.name.trim()) e[`med_name_${i}`] = 'Medicine name required';
    if (!m.dosage.trim()) e[`med_dose_${i}`] = 'Dosage required';
    if (!m.frequency) e[`med_freq_${i}`] = 'Frequency required';
  });
  return e;
};

const RxModal = ({ rx, onClose, onSave }) => {
  const isEdit = !!rx?.id;
  const [form, setForm] = useState(isEdit ? { ...rx, medications: rx.medications.map(m => ({ ...m })) } : { ...BLANK_RX, medications: [{ ...BLANK_MED }] });
  const [errors, setErrors] = useState({});

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setMed = (i, k, v) => setForm((f) => {
    const meds = [...f.medications];
    meds[i] = { ...meds[i], [k]: v };
    return { ...f, medications: meds };
  });
  const addMed = () => setForm((f) => ({ ...f, medications: [...f.medications, { ...BLANK_MED }] }));
  const removeMed = (i) => setForm((f) => ({ ...f, medications: f.medications.filter((_, idx) => idx !== i) }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave(form);
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="rx-modal-title" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box modal-box--lg">
        <div className="modal-header">
          <h2 id="rx-modal-title">{isEdit ? 'Edit Prescription' : 'New Prescription'}</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>
        <form className="modal-form" onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <div className={`form-field ${errors.patient ? 'has-error' : ''}`}>
              <label htmlFor="rx-patient">Patient *</label>
              <select id="rx-patient" value={form.patient} onChange={(e) => setField('patient', e.target.value)}>
                <option value="">Select patient</option>
                {PATIENTS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              {errors.patient && <span className="field-error">{errors.patient}</span>}
            </div>
            <div className={`form-field ${errors.diagnosis ? 'has-error' : ''}`}>
              <label htmlFor="rx-diag">Diagnosis *</label>
              <input id="rx-diag" value={form.diagnosis} onChange={(e) => setField('diagnosis', e.target.value)} placeholder="Primary diagnosis" />
              {errors.diagnosis && <span className="field-error">{errors.diagnosis}</span>}
            </div>
          </div>

          <div className="rx-meds-section">
            <div className="rx-meds-header">
              <h3>Medications</h3>
              <button type="button" className="btn btn-ghost btn-sm" onClick={addMed}><Plus size={14} aria-hidden="true" /> Add Medication</button>
            </div>
            {errors.medications && <span className="field-error">{errors.medications}</span>}
            {form.medications.map((med, i) => (
              <div key={i} className="med-row">
                <div className="med-row-header">
                  <span className="med-row-num">#{i + 1}</span>
                  {form.medications.length > 1 && (
                    <button type="button" className="icon-btn icon-btn--danger ml-auto" onClick={() => removeMed(i)} aria-label="Remove medication"><Trash2 size={14} aria-hidden="true" /></button>
                  )}
                </div>
                <div className="form-row">
                  <div className={`form-field ${errors[`med_name_${i}`] ? 'has-error' : ''}`}>
                    <label htmlFor={`med-name-${i}`}>Medicine Name *</label>
                    <input id={`med-name-${i}`} value={med.name} onChange={(e) => setMed(i, 'name', e.target.value)} placeholder="e.g. Paracetamol" />
                    {errors[`med_name_${i}`] && <span className="field-error">{errors[`med_name_${i}`]}</span>}
                  </div>
                  <div className={`form-field ${errors[`med_dose_${i}`] ? 'has-error' : ''}`}>
                    <label htmlFor={`med-dose-${i}`}>Dosage *</label>
                    <input id={`med-dose-${i}`} value={med.dosage} onChange={(e) => setMed(i, 'dosage', e.target.value)} placeholder="e.g. 500mg" />
                    {errors[`med_dose_${i}`] && <span className="field-error">{errors[`med_dose_${i}`]}</span>}
                  </div>
                </div>
                <div className="form-row">
                  <div className={`form-field ${errors[`med_freq_${i}`] ? 'has-error' : ''}`}>
                    <label htmlFor={`med-freq-${i}`}>Frequency *</label>
                    <select id={`med-freq-${i}`} value={med.frequency} onChange={(e) => setMed(i, 'frequency', e.target.value)}>
                      <option value="">Select frequency</option>
                      {FREQUENCIES.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                    {errors[`med_freq_${i}`] && <span className="field-error">{errors[`med_freq_${i}`]}</span>}
                  </div>
                  <div className="form-field">
                    <label htmlFor={`med-dur-${i}`}>Duration</label>
                    <select id={`med-dur-${i}`} value={med.duration} onChange={(e) => setMed(i, 'duration', e.target.value)}>
                      <option value="">Select duration</option>
                      {DURATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-field">
                  <label htmlFor={`med-instr-${i}`}>Special Instructions</label>
                  <input id={`med-instr-${i}`} value={med.instructions} onChange={(e) => setMed(i, 'instructions', e.target.value)} placeholder="e.g. Take after meal, avoid alcohol" />
                </div>
              </div>
            ))}
          </div>

          <div className="form-field">
            <label htmlFor="rx-notes">Additional Notes</label>
            <textarea id="rx-notes" value={form.notes} onChange={(e) => setField('notes', e.target.value)} placeholder="Additional clinical notes…" rows={3} />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{isEdit ? 'Update Prescription' : 'Sign & Save Prescription'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Prescriptions = () => {
  const { role, canEdit } = useAuth();
  const isDoctor = role === 'doctor';
  const isPharmacist = role === 'pharmacist';
  const isAdmin = role === 'admin';

  const [rxList, setRxList] = useState(INITIAL_RX);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modal, setModal] = useState(null);
  const { toast, showToast } = useToast();

  // Doctor sees own prescriptions only
  const baseList = isDoctor
    ? rxList.filter(rx => rx.doctor === 'Dr. Fatima Noor')
    : rxList;

  const filtered = baseList.filter((rx) => {
    const q = search.toLowerCase();
    return (rx.patient.toLowerCase().includes(q) || rx.diagnosis.toLowerCase().includes(q)) &&
           (!filterStatus || rx.status === filterStatus);
  });

  const handleSave = (form) => {
    if (form.id) {
      setRxList((prev) => prev.map((rx) => rx.id === form.id ? { ...rx, ...form } : rx));
      showToast('Prescription updated.');
    } else {
      setRxList((prev) => [...prev, { ...form, id: `RX-${String(rxList.length + 1).padStart(3,'0')}`, doctor: 'Dr. Fatima Noor', date: '2026-07-03', status: 'pending' }]);
      showToast('Prescription saved and signed.');
    }
    setModal(null);
  };

  const handleDispense = (rx) => {
    setRxList((prev) => prev.map((r) => r.id === rx.id ? { ...r, status: 'dispensed' } : r));
    showToast('Marked as dispensed.');
    setModal(null);
  };

  return (
    <div className="rx-page">
      <div className="page-header">
        <div>
          <h2>Prescriptions</h2>
          <p className="page-subtitle">
            {isPharmacist ? 'Pending dispense' : 'All prescriptions'} — {filtered.filter(r => r.status === 'pending').length} pending
          </p>
        </div>
        {isDoctor && (
          <button className="btn btn-primary" onClick={() => setModal({ type: 'new' })}>
            <Plus size={16} /> New Prescription
          </button>
        )}
      </div>

      <div className="table-controls">
        <div className="search-box">
          <Search size={16} />
          <input type="search" placeholder="Search by patient or diagnosis…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search prescriptions" />
        </div>
        <div className="filter-group">
          <ChevronDown size={14} className="filter-icon" />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} aria-label="Filter by status">
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="dispensed">Dispensed</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        {filtered.length === 0 ? (
          <EmptyState icon={ClipboardList} message="No prescriptions found." actionLabel="Clear Filters" onAction={() => { setSearch(''); setFilterStatus(''); }} />
        ) : (
          <table className="data-table" aria-label="Prescriptions">
            <thead>
              <tr>
                <th>Rx ID</th>
                <th>Patient</th>
                {!isDoctor && <th>Doctor</th>}
                <th>Date</th>
                <th>Diagnosis</th>
                <th>Medications</th>
                <th>Status</th>
                {(isDoctor || isPharmacist) && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((rx) => (
                <tr key={rx.id}>
                  <td><span className="rx-id">{rx.id}</span></td>
                  <td className="cell-name">{rx.patient.split(' (')[0]}</td>
                  {!isDoctor && <td className="text-secondary">{rx.doctor}</td>}
                  <td className="text-muted">{rx.date}</td>
                  <td className="text-secondary">{rx.diagnosis}</td>
                  <td>
                    <div className="rx-med-list">
                      {rx.medications.map((m, i) => (
                        <span key={i} className="rx-med-chip">{m.name} {m.dosage}</span>
                      ))}
                    </div>
                  </td>
                  <td>
                    {rx.status === 'dispensed'
                      ? <span className="badge badge--green">Dispensed</span>
                      : <span className="badge badge--amber">Pending</span>
                    }
                  </td>
                  {(isDoctor || isPharmacist) && (
                    <td>
                      <div className="action-btns">
                        {isDoctor && rx.status !== 'dispensed' && (
                          <button className="icon-btn" title="Edit prescription" onClick={() => setModal({ type: 'edit', data: rx })} aria-label="Edit prescription">
                            <ClipboardList size={15} />
                          </button>
                        )}
                        {isPharmacist && rx.status === 'pending' && (
                          <button className="icon-btn icon-btn--success" title="Mark dispensed" onClick={() => setModal({ type: 'dispense', data: rx })} aria-label="Mark as dispensed">
                            <CheckCircle2 size={15} />
                          </button>
                        )}
                        {rx.status === 'dispensed' && (
                          <span className="rx-locked" title="Locked after dispensing" aria-label="Locked"><Lock size={14} /></span>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {(modal?.type === 'new' || modal?.type === 'edit') && (
        <RxModal rx={modal.data} onClose={() => setModal(null)} onSave={handleSave} />
      )}
      {modal?.type === 'dispense' && (
        <ConfirmModal
          title="Confirm Dispense"
          message={`Mark ${modal.data.id} for ${modal.data.patient.split(' (')[0]} as dispensed? This cannot be undone.`}
          confirmLabel="Confirm Dispense"
          variant="secondary"
          onConfirm={() => handleDispense(modal.data)}
          onClose={() => setModal(null)}
        />
      )}

      {toast && <div className="toast toast--success" role="status">{toast}</div>}
    </div>
  );
};

export default Prescriptions;
