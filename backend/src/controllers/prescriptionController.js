import Prescription from '../models/Prescription.js';
import Patient from '../models/Patient.js';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { nextId } from '../utils/generateId.js';
import { deductForMedications } from '../utils/matchInventory.js';
import { safeSearchRegex } from '../utils/escapeRegex.js';

const buildFilter = (query) => {
  const filter = {};
  if (typeof query.status === 'string') filter.status = query.status;
  if (typeof query.patientId === 'string') filter.patientId = query.patientId;
  if (typeof query.doctorId === 'string') filter.doctorId = query.doctorId;
  if (query.dateFrom || query.dateTo) {
    filter.date = {};
    if (query.dateFrom) filter.date.$gte = new Date(query.dateFrom);
    if (query.dateTo) filter.date.$lte = new Date(query.dateTo);
  }
  const re = safeSearchRegex(query.q);
  if (re) filter.$or = [{ patient: re }, { diagnosis: re }];
  return filter;
};

export const getPrescriptions = asyncHandler(async (req, res) => {
  const filter = buildFilter(req.query);

  // Doctors only ever see prescriptions they authored, enforced server-side
  // rather than trusting the client to filter.
  if (req.user.role === 'doctor') {
    const author = await User.findById(req.user.id);
    filter.doctorId = author?.doctorId;
  }

  const prescriptions = await Prescription.find(filter).sort({ date: -1 });
  res.json(prescriptions);
});

export const createPrescription = asyncHandler(async (req, res) => {
  const { patientId, diagnosis, medications, notes } = req.body;

  const patient = await Patient.findOne({ patientId });
  if (!patient) return res.status(400).json({ message: `Unknown patient: ${patientId}` });

  const author = await User.findById(req.user.id).populate('doctorId');
  if (!author?.doctorId) return res.status(400).json({ message: 'No doctor profile linked to this account.' });

  const rxId = await nextId(Prescription, 'rxId', 'RX');
  const prescription = await Prescription.create({
    rxId,
    patientId: patient._id,
    patient: `${patient.name} (${patient.patientId})`,
    doctorId: author.doctorId._id,
    doctor: author.doctorId.name,
    date: new Date(),
    diagnosis,
    medications,
    notes: notes || '',
    status: 'pending',
  });

  res.status(201).json(prescription);
});

export const updatePrescription = asyncHandler(async (req, res) => {
  const existing = await Prescription.findOne({ rxId: req.params.id });
  if (!existing) return res.status(404).json({ message: 'Prescription not found' });
  if (existing.status === 'dispensed') return res.status(409).json({ message: 'Dispensed prescriptions cannot be edited.' });

  // Doctors may only edit prescriptions they authored, enforced server-side
  // the same way getPrescriptions/createPrescription already scope by doctorId.
  if (req.user.role === 'doctor') {
    const author = await User.findById(req.user.id);
    if (!author?.doctorId || String(existing.doctorId) !== String(author.doctorId)) {
      return res.status(403).json({ message: 'You can only edit prescriptions you authored.' });
    }
  }

  const { diagnosis, medications, notes } = req.body;
  existing.diagnosis = diagnosis ?? existing.diagnosis;
  existing.medications = medications ?? existing.medications;
  existing.notes = notes ?? existing.notes;
  await existing.save();

  res.json(existing);
});

export const dispensePrescription = asyncHandler(async (req, res) => {
  const prescription = await Prescription.findOne({ rxId: req.params.id });
  if (!prescription) return res.status(404).json({ message: 'Prescription not found' });
  if (prescription.status === 'dispensed') return res.status(409).json({ message: 'Already dispensed.' });

  const { deductions, warnings } = await deductForMedications(prescription.medications);

  prescription.status = 'dispensed';
  prescription.dispensedAt = new Date();
  prescription.dispensedBy = req.user.id;
  prescription.inventoryDeductions = deductions;
  await prescription.save();

  res.json({ prescription, deductions, warnings });
});
