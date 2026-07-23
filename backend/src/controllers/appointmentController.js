import Appointment from '../models/Appointment.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { nextId } from '../utils/generateId.js';
import { safeSearchRegex } from '../utils/escapeRegex.js';

const buildFilter = (query) => {
  const filter = {};
  if (typeof query.status === 'string') filter.status = query.status;
  if (typeof query.patientId === 'string') filter.patientId = query.patientId;
  if (typeof query.doctorId === 'string') filter.doctorId = query.doctorId;
  if (query.dateFrom || query.dateTo) {
    filter.date = {};
    if (query.dateFrom) filter.date.$gte = query.dateFrom;
    if (query.dateTo) filter.date.$lte = query.dateTo;
  }
  const re = safeSearchRegex(query.q);
  if (re) filter.$or = [{ patientName: re }, { doctor: re }];
  return filter;
};

export const getAppointments = asyncHandler(async (req, res) => {
  const filter = buildFilter(req.query);

  // Doctors only ever see their own appointments (read-only), enforced server-side.
  if (req.user.role === 'doctor') {
    const viewer = await User.findById(req.user.id);
    filter.doctorId = viewer?.doctorId;
  }

  const appointments = await Appointment.find(filter)
    .sort({ date: 1, time: 1 })
    .populate('patientId', 'patientId name')
    .populate('doctorId', 'doctorId name');
  res.json(appointments);
});

export const createAppointment = asyncHandler(async (req, res) => {
  const { patientId, doctorId, date, time, type, notes } = req.body;

  const patient = await Patient.findOne({ patientId });
  if (!patient) return res.status(400).json({ message: `Unknown patient: ${patientId}` });
  const doctor = await Doctor.findOne({ doctorId });
  if (!doctor) return res.status(400).json({ message: `Unknown doctor: ${doctorId}` });

  const conflict = await Appointment.findOne({ doctorId: doctor._id, date, time, status: { $ne: 'cancelled' } });
  if (conflict) return res.status(409).json({ message: 'This doctor already has an appointment at that date and time.' });

  const apptId = await nextId(Appointment, 'apptId', 'APT');
  const appointment = await Appointment.create({
    apptId,
    patientId: patient._id,
    patientName: patient.name,
    doctorId: doctor._id,
    doctor: doctor.name,
    date,
    time,
    type,
    notes: notes || '',
    status: 'pending',
  });

  res.status(201).json(appointment);
});

export const updateAppointment = asyncHandler(async (req, res) => {
  const { patientId, doctorId, ...rest } = req.body;
  const update = { ...rest };

  const current = await Appointment.findOne({ apptId: req.params.id });
  if (!current) return res.status(404).json({ message: 'Appointment not found' });

  if (patientId) {
    const patient = await Patient.findOne({ patientId });
    if (!patient) return res.status(400).json({ message: `Unknown patient: ${patientId}` });
    update.patientId = patient._id;
    update.patientName = patient.name;
  }
  if (doctorId) {
    const doctor = await Doctor.findOne({ doctorId });
    if (!doctor) return res.status(400).json({ message: `Unknown doctor: ${doctorId}` });
    update.doctorId = doctor._id;
    update.doctor = doctor.name;
  }

  if (update.date || update.time || update.doctorId) {
    const conflict = await Appointment.findOne({
      _id: { $ne: current._id },
      doctorId: update.doctorId || current.doctorId,
      date: update.date || current.date,
      time: update.time || current.time,
      status: { $ne: 'cancelled' },
    });
    if (conflict) return res.status(409).json({ message: 'This doctor already has an appointment at that date and time.' });
  }

  const appointment = await Appointment.findOneAndUpdate({ apptId: req.params.id }, update, { new: true, runValidators: true });
  if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
  res.json(appointment);
});
