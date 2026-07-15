import { useState, useEffect } from 'react';
import { Plus, Search, ChevronDown, X, Trash2, ClipboardList, CheckCircle2, Lock, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ConfirmModal from '../components/ConfirmModal';
import useToast from '../hooks/useToast';
import useApiResource from '../hooks/useApiResource';
import useTableFilters from '../hooks/useTableFilters';
import { prescriptionService, patientService } from '../services/api';
import { generatePrescriptionPdf } from '../utils/pdf';
import './Prescriptions.css';

const FREQUENCIES = ['Once daily', 'Twice daily', 'Three times daily', 'Four times daily', 'Every 8 hours', 'Every 12 hours', 'As needed', 'At night'];
const DURATIONS = ['3 days', '5 days', '7 days', '10 days', '14 days', '1 month', '3 months', 'Ongoing'];

const BLANK_MED = { name: '', dosage: '', frequency: '', duration: '', instructions: '' };
const BLANK_RX = { patientId: '', diagnosis: '', notes: '', medications: [{ ...BLANK_MED }] };

const validate = (form) => {
  const e = {};
  if (!form.patientId) e.patientId = 'Patient is required';
  if (!form.diagnosis.trim()) e.diagnosis = 'Diagnosis is required';
  if (form.medications.length === 0) e.medications = 'At least one medication is required';
  form.medications.forEach((m, i) => {
    if (!m.name.trim()) e[`med_name_${i}`] = 'Medicine name required';
    if (!m.dosage.trim()) e[`med_dose_${i}`] = 'Dosage required';
    if (!m.frequency) e[`med_freq_${i}`] = 'Frequency required';
  });
  return e;
};

const RxModal = ({ rx, patients, onClose, onSave }) => {
  const isEdit = !!rx?.id;
  const [form, setForm] = useState(
    isEdit ? { ...rx, medications: rx.medications.map(m => ({ ...m })) } : { ...BLANK_RX, medications: [{ ...BLANK_MED }], ...(rx || {}) }
  );
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
            <div className={`form-field ${errors.patientId ? 'has-error' : ''}`}>
              <label htmlFor="rx-patient">Patient *</label>
              {isEdit ? (
                <input id="rx-patient" value={form.patientLabel} disabled />
              ) : (
                <select id="rx-patient" value={form.patientId} onChange={(e) => setField('patientId', e.target.value)}>
                  <option value="">Select patient</option>
                  {patients.map((p) => <option key={p.patientId} value={p.patientId}>{p.name} ({p.patientId})</option>)}
                </select>
              )}
              {errors.patientId && <span className="field-error">{errors.patientId}</span>}
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
  const { role } = useAuth();
  const { payload, clearPayload } = useNavigation();
  const isDoctor = role === 'doctor';
  const isPharmacist = role === 'pharmacist';

  const { data: rxData, loading, error, refetch } = useApiResource(() => prescriptionService.getAll());
  // Only doctors ever open the "new prescription" patient picker — avoid an
  // unnecessary (and, for pharmacist/admin, permission-denied) patients fetch otherwise.
  const { data: patientData } = useApiResource(() => (isDoctor ? patientService.getAll() : Promise.resolve([])), [isDoctor]);
  const [modal, setModal] = useState(null);
  const { toast, showToast } = useToast();

  const rxList = rxData || [];
  const patients = patientData || [];
  const doctorNames = [...new Set(rxList.map(rx => rx.doctor))];

  const {
    filtered, search, setSearch, filterValues, setFilter, dateFrom, setDateFrom, dateTo, setDateTo, clearAll,
  } = useTableFilters(rxList, {
    searchFields: [(rx) => rx.patient, (rx) => rx.diagnosis],
    filters: { status: (rx) => rx.status, doctor: (rx) => rx.doctor },
    dateField: (rx) => new Date(rx.date).toISOString().split('T')[0],
  });

  // Arriving here via Appointments' "Write Prescription" quick action pre-fills the patient.
  useEffect(() => {
    if (isDoctor && payload?.prefillPatientId) {
      setModal({ type: 'new', data: { patientId: payload.prefillPatientId } });
      clearPayload();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload]);

  const handleSave = async (form) => {
    try {
      if (form.id) {
        await prescriptionService.update(form.id, { diagnosis: form.diagnosis, medications: form.medications, notes: form.notes });
        showToast('Prescription updated.');
      } else {
        await prescriptionService.create({ patientId: form.patientId, diagnosis: form.diagnosis, medications: form.medications, notes: form.notes });
        showToast('Prescription saved and signed.');
      }
      await refetch();
      setModal(null);
    } catch (err) {
      showToast(err.message || 'Failed to save prescription.');
    }
  };

  const handleDispense = async (rx) => {
    try {
      const { warnings } = await prescriptionService.dispense(rx.rxId);
      await refetch();
      showToast('Marked as dispensed.');
      if (warnings?.length) showToast(warnings.join(' '));
      setModal(null);
    } catch (err) {
      showToast(err.message || 'Failed to dispense.');
    }
  };

  if (loading) {
    return (
      <div className="rx-page" aria-busy="true" aria-label="Loading…">
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
        <EmptyState icon={ClipboardList} message={error} actionLabel="Retry" onAction={refetch} />
      </div>
    );
  }

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
          <select value={filterValues.status} onChange={(e) => setFilter('status', e.target.value)} aria-label="Filter by status">
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="dispensed">Dispensed</option>
          </select>
        </div>
        {!isDoctor && (
          <div className="filter-group">
            <ChevronDown size={14} className="filter-icon" />
            <select value={filterValues.doctor} onChange={(e) => setFilter('doctor', e.target.value)} aria-label="Filter by doctor">
              <option value="">All Doctors</option>
              {doctorNames.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        )}
        <div className="filter-group date-range-group">
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} aria-label="From date" />
          <span className="text-muted">to</span>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} aria-label="To date" />
        </div>
      </div>

      <div className="table-container">
        {filtered.length === 0 ? (
          <EmptyState icon={ClipboardList} message="No prescriptions found." actionLabel="Clear Filters" onAction={clearAll} />
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((rx) => (
                <tr key={rx.rxId}>
                  <td><span className="rx-id">{rx.rxId}</span></td>
                  <td className="cell-name">{rx.patient.split(' (')[0]}</td>
                  {!isDoctor && <td className="text-secondary">{rx.doctor}</td>}
                  <td className="text-muted">{new Date(rx.date).toLocaleDateString('en-CA')}</td>
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
                  <td>
                    <div className="action-btns">
                      <button className="icon-btn" title="Download PDF" onClick={() => generatePrescriptionPdf(rx)} aria-label={`Download PDF for ${rx.rxId}`}>
                        <Download size={15} />
                      </button>
                      {isDoctor && rx.status !== 'dispensed' && (
                        <button className="icon-btn" title="Edit prescription" onClick={() => setModal({ type: 'edit', data: { id: rx.rxId, patientLabel: rx.patient, diagnosis: rx.diagnosis, notes: rx.notes, medications: rx.medications } })} aria-label="Edit prescription">
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
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {(modal?.type === 'new' || modal?.type === 'edit') && (
        <RxModal rx={modal.data} patients={patients} onClose={() => setModal(null)} onSave={handleSave} />
      )}
      {modal?.type === 'dispense' && (
        <ConfirmModal
          title="Confirm Dispense"
          message={`Mark ${modal.data.rxId} for ${modal.data.patient.split(' (')[0]} as dispensed? This cannot be undone.`}
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
