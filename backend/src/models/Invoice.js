import mongoose from 'mongoose';

const serviceLineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    qty: { type: Number, required: true, min: 0.01 },
    rate: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const paymentSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true, min: 0.01 },
    method: { type: String, required: true },
    date: { type: Date, default: Date.now },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceId: { type: String, required: true, unique: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    patient: { type: String, required: true }, // snapshot 'Name (PT-xxxx)'
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', default: null },
    date: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    services: { type: [serviceLineSchema], required: true },
    discount: { type: Number, default: 0, min: 0 },
    paid: { type: Number, default: 0 },
    payments: { type: [paymentSchema], default: [] },
    status: { type: String, enum: ['paid', 'partial', 'unpaid', 'overdue'], default: 'unpaid' },
  },
  { timestamps: true }
);

export default mongoose.model('Invoice', invoiceSchema);
