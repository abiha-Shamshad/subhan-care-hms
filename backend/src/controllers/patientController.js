import Patient from '../models/Patient.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { nextId } from '../utils/generateId.js';

// Fields that identify a person outside the clinic (national ID, home address,
// next-of-kin contact) rather than fields needed to run a clinical/billing workflow.
// Roles without a clinical or front-desk reason to see them get them stripped.
const IDENTITY_FIELDS = ['cnic', 'address', 'emergencyContact'];
const ROLES_WITH_FULL_PATIENT_VIEW = ['admin', 'receptionist', 'doctor'];

const sanitizeForRole = (patientDoc, role) => {
  const patient = patientDoc.toObject ? patientDoc.toObject() : patientDoc;
  if (ROLES_WITH_FULL_PATIENT_VIEW.includes(role)) return patient;
  for (const field of IDENTITY_FIELDS) delete patient[field];
  return patient;
};

export const getPatients = asyncHandler(async (req, res) => {
  const patients = await Patient.find({ deletedAt: null }).sort({ createdAt: 1 });
  res.json(patients.map((p) => sanitizeForRole(p, req.user.role)));
});

export const getPatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ patientId: req.params.id });
  if (!patient) return res.status(404).json({ message: 'Patient not found' });
  res.json(sanitizeForRole(patient, req.user.role));
});

export const createPatient = asyncHandler(async (req, res) => {
  const patientId = await nextId(Patient, 'patientId', 'PT', { padLength: 4, startAt: 1001 });
  const patient = await Patient.create({ ...req.body, patientId });
  res.status(201).json(patient);
});

// Fields a caller may edit directly. Excludes patientId/_id/timestamps and, in
// particular, deletedAt: that field is only ever set by the admin-only
// deletePatient anonymization flow, and must not be reachable through a
// generic update (which receptionist/doctor roles also have write access to).
const PATIENT_EDITABLE_FIELDS = [
  'name', 'dob', 'age', 'gender', 'phone', 'cnic', 'address',
  'emergencyContact', 'lastVisit', 'registrationDate',
];

export const updatePatient = asyncHandler(async (req, res) => {
  const updates = {};
  for (const field of PATIENT_EDITABLE_FIELDS) {
    if (field in req.body) updates[field] = req.body[field];
  }

  const patient = await Patient.findOneAndUpdate(
    { patientId: req.params.id, deletedAt: null },
    updates,
    { new: true, runValidators: true }
  );
  if (!patient) return res.status(404).json({ message: 'Patient not found' });
  res.json(patient);
});

// "Delete" anonymizes rather than removes the row: other collections (invoices,
// appointments, prescriptions) keep a denormalized name snapshot for billing/audit
// history, so a hard delete wouldn't erase the name anyway and would orphan those
// records' patientId reference. Scrubbing identifying fields here satisfies a
// deletion request while leaving referential integrity intact.
export const deletePatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ patientId: req.params.id });
  if (!patient) return res.status(404).json({ message: 'Patient not found' });

  patient.name = 'Deleted Patient';
  patient.dob = '';
  patient.phone = '';
  patient.cnic = '';
  patient.address = '';
  patient.emergencyContact = '';
  patient.deletedAt = new Date();
  await patient.save();

  res.json({ message: 'Patient data has been deleted and anonymized.' });
});
