import Invoice from '../models/Invoice.js';
import Patient from '../models/Patient.js';
import Appointment from '../models/Appointment.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { nextId } from '../utils/generateId.js';
import { deriveInvoiceStatus } from '../utils/invoiceMath.js';

const buildFilter = (query) => {
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.patientId) filter.patientId = query.patientId;
  if (query.dateFrom || query.dateTo) {
    filter.date = {};
    if (query.dateFrom) filter.date.$gte = new Date(query.dateFrom);
    if (query.dateTo) filter.date.$lte = new Date(query.dateTo);
  }
  if (query.q) {
    const re = new RegExp(query.q, 'i');
    filter.$or = [{ patient: re }, { invoiceId: re }, { 'services.name': re }];
  }
  return filter;
};

export const getInvoices = asyncHandler(async (req, res) => {
  const invoices = await Invoice.find(buildFilter(req.query)).sort({ date: -1 });
  res.json(invoices);
});

export const createInvoice = asyncHandler(async (req, res) => {
  const { patientId, date, dueDate, services, discount, appointmentId } = req.body;

  const patient = await Patient.findOne({ patientId });
  if (!patient) return res.status(400).json({ message: `Unknown patient: ${patientId}` });

  const invoiceId = await nextId(Invoice, 'invoiceId', 'INV');
  const invoice = new Invoice({
    invoiceId,
    patientId: patient._id,
    patient: `${patient.name} (${patient.patientId})`,
    appointmentId: appointmentId || null,
    date: date ? new Date(date) : new Date(),
    dueDate: new Date(dueDate),
    services,
    discount: discount || 0,
    paid: 0,
    payments: [],
  });
  invoice.status = deriveInvoiceStatus(invoice);
  await invoice.save();

  res.status(201).json(invoice);
});

export const recordPayment = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findOne({ invoiceId: req.params.id });
  if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

  const { amount, method } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ message: 'Payment amount must be greater than 0.' });

  invoice.payments.push({ amount, method: method || 'Cash', date: new Date(), recordedBy: req.user.id });
  invoice.paid += amount;
  invoice.status = deriveInvoiceStatus(invoice);
  await invoice.save();

  res.json(invoice);
});

/** Returns a draft invoice payload (not persisted) pre-filled from a completed appointment. */
const APPOINTMENT_TYPE_RATES = {
  Consultation: 1500,
  'Follow-up': 1000,
  Emergency: 3000,
  Procedure: 2500,
  'Check-up': 1200,
};

export const draftInvoiceFromAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findOne({ apptId: req.params.appointmentId }).populate('patientId', 'patientId name');
  if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
  if (appointment.status !== 'completed') return res.status(400).json({ message: 'Only completed appointments can be billed.' });

  const rate = APPOINTMENT_TYPE_RATES[appointment.type] || 1500;
  const today = new Date();
  const due = new Date(today);
  due.setDate(due.getDate() + 7);

  res.json({
    patientId: appointment.patientId.patientId,
    appointmentId: appointment.apptId,
    date: today.toISOString().split('T')[0],
    dueDate: due.toISOString().split('T')[0],
    services: [{ name: `${appointment.type} Fee`, qty: 1, rate }],
    discount: 0,
  });
});
