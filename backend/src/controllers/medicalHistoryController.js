import MedicalHistoryEntry from '../models/MedicalHistoryEntry.js';
import Patient from '../models/Patient.js';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { nextId } from '../utils/generateId.js';

export const getHistoryForPatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ patientId: req.params.patientId });
  if (!patient) return res.status(404).json({ message: 'Patient not found' });

  const entries = await MedicalHistoryEntry.find({ patientId: patient._id }).sort({ timestamp: -1 });
  res.json(entries);
});

export const addHistoryEntry = asyncHandler(async (req, res) => {
  const patient = await Patient.findOne({ patientId: req.params.patientId });
  if (!patient) return res.status(404).json({ message: 'Patient not found' });

  const author = await User.findById(req.user.id).populate('doctorId');
  if (!author?.doctorId) return res.status(400).json({ message: 'No doctor profile linked to this account.' });

  const { diagnosis, notes } = req.body;
  const entryId = await nextId(MedicalHistoryEntry, 'entryId', 'MH');
  const entry = await MedicalHistoryEntry.create({
    entryId,
    patientId: patient._id,
    doctorId: author.doctorId._id,
    doctor: author.doctorId.name,
    date: new Date(),
    diagnosis,
    notes,
    timestamp: new Date(),
    createdBy: author._id,
  });

  res.status(201).json(entry);
});
