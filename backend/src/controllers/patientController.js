import Patient from '../models/Patient.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { nextId } from '../utils/generateId.js';

export const getPatients = asyncHandler(async (req, res) => {
  const patients = await Patient.find().sort({ createdAt: 1 });
  res.json(patients);
});

export const getPatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ patientId: req.params.id });
  if (!patient) return res.status(404).json({ message: 'Patient not found' });
  res.json(patient);
});

export const createPatient = asyncHandler(async (req, res) => {
  const patientId = await nextId(Patient, 'patientId', 'PT', { padLength: 4, startAt: 1001 });
  const patient = await Patient.create({ ...req.body, patientId });
  res.status(201).json(patient);
});

export const updatePatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findOneAndUpdate({ patientId: req.params.id }, req.body, { new: true, runValidators: true });
  if (!patient) return res.status(404).json({ message: 'Patient not found' });
  res.json(patient);
});
