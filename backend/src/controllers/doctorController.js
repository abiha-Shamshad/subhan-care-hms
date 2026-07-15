import Doctor from '../models/Doctor.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { nextId } from '../utils/generateId.js';

export const getDoctors = asyncHandler(async (req, res) => {
  const doctors = await Doctor.find().sort({ createdAt: 1 });
  res.json(doctors);
});

export const getDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ doctorId: req.params.id });
  if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
  res.json(doctor);
});

export const createDoctor = asyncHandler(async (req, res) => {
  const doctorId = await nextId(Doctor, 'doctorId', 'DR', { padLength: 3, startAt: 1 });
  const doctor = await Doctor.create({ ...req.body, doctorId });
  res.status(201).json(doctor);
});

export const updateDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOneAndUpdate({ doctorId: req.params.id }, req.body, { new: true, runValidators: true });
  if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
  res.json(doctor);
});
