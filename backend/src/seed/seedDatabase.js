import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import Appointment from '../models/Appointment.js';
import Prescription from '../models/Prescription.js';
import MedicalHistoryEntry from '../models/MedicalHistoryEntry.js';
import InventoryItem from '../models/InventoryItem.js';
import Invoice from '../models/Invoice.js';
import { deriveInventoryStatus } from '../utils/inventoryStatus.js';
import { deriveInvoiceStatus } from '../utils/invoiceMath.js';
import { DEMO_USERS, DOCTORS, PATIENTS, APPOINTMENTS, PRESCRIPTIONS, MEDICAL_HISTORY, INVENTORY, INVOICES } from './seedData.js';

/** Drops and repopulates every collection from the app's demo data set. Assumes a DB connection already exists. */
export const seedDatabase = async () => {
  await Promise.all([
    User.deleteMany({}),
    Doctor.deleteMany({}),
    Patient.deleteMany({}),
    Appointment.deleteMany({}),
    Prescription.deleteMany({}),
    MedicalHistoryEntry.deleteMany({}),
    InventoryItem.deleteMany({}),
    Invoice.deleteMany({}),
  ]);

  const doctors = await Doctor.insertMany(DOCTORS);
  const patients = await Patient.insertMany(PATIENTS);
  const doctorById = new Map(doctors.map((d) => [d.doctorId, d]));
  const patientById = new Map(patients.map((p) => [p.patientId, p]));

  const users = await Promise.all(
    DEMO_USERS.map(async (u) => ({
      name: u.name,
      email: u.email,
      passwordHash: await bcrypt.hash(u.password, 10),
      role: u.role,
      doctorId: u.doctorId ? doctorById.get(u.doctorId)?._id : null,
    }))
  );
  await User.insertMany(users);

  const appointments = APPOINTMENTS.map((a) => {
    const patient = patientById.get(a.patientId);
    const doctor = doctorById.get(a.doctorId);
    return {
      apptId: a.apptId,
      patientId: patient._id,
      patientName: patient.name,
      doctorId: doctor._id,
      doctor: doctor.name,
      date: a.date,
      time: a.time,
      type: a.type,
      status: a.status,
      notes: a.notes,
    };
  });
  await Appointment.insertMany(appointments);

  const prescriptions = PRESCRIPTIONS.map((rx) => {
    const patient = patientById.get(rx.patientId);
    const doctor = doctorById.get(rx.doctorId);
    return {
      rxId: rx.rxId,
      patientId: patient._id,
      patient: `${patient.name} (${patient.patientId})`,
      doctorId: doctor._id,
      doctor: doctor.name,
      date: new Date(rx.date),
      diagnosis: rx.diagnosis,
      medications: rx.medications,
      notes: rx.notes,
      status: rx.status,
    };
  });
  await Prescription.insertMany(prescriptions);

  const historyEntries = MEDICAL_HISTORY.map((h) => {
    const patient = patientById.get(h.patientId);
    const doctor = doctorById.get(h.doctorId);
    return {
      entryId: h.entryId,
      patientId: patient._id,
      doctorId: doctor._id,
      doctor: doctor.name,
      date: new Date(h.date),
      diagnosis: h.diagnosis,
      notes: h.notes,
      timestamp: new Date(h.timestamp),
    };
  });
  await MedicalHistoryEntry.insertMany(historyEntries);

  // insertMany() bypasses pre('save') hooks, so status/derived fields are computed here.
  const inventoryItems = INVENTORY.map((i) => ({ ...i, status: deriveInventoryStatus(i.quantity, i.reorderLevel) }));
  await InventoryItem.insertMany(inventoryItems);

  const invoices = INVOICES.map((inv) => {
    const patient = patientById.get(inv.patientId);
    return {
      invoiceId: inv.invoiceId,
      patientId: patient._id,
      patient: `${patient.name} (${patient.patientId})`,
      date: new Date(inv.date),
      dueDate: new Date(inv.dueDate),
      services: inv.services,
      discount: inv.discount,
      paid: inv.paid,
      payments: [],
      status: deriveInvoiceStatus({ services: inv.services, discount: inv.discount, paid: inv.paid, dueDate: inv.dueDate }),
    };
  });
  await Invoice.insertMany(invoices);

  return {
    users: users.length,
    doctors: doctors.length,
    patients: patients.length,
    appointments: appointments.length,
    prescriptions: prescriptions.length,
    medicalHistory: historyEntries.length,
    inventoryItems: inventoryItems.length,
    invoices: invoices.length,
  };
};
