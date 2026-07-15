import mongoose from 'mongoose';

const medicationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: { type: String, required: true },
    duration: { type: String, default: '' },
    instructions: { type: String, default: '' },
  },
  { _id: false }
);

const inventoryDeductionSchema = new mongoose.Schema(
  {
    medicationName: String,
    matchedItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem', default: null },
    matchedItemName: { type: String, default: null },
    quantityDeducted: { type: Number, default: 0 },
    matched: { type: Boolean, default: false },
  },
  { _id: false }
);

const prescriptionSchema = new mongoose.Schema(
  {
    rxId: { type: String, required: true, unique: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    patient: { type: String, required: true }, // snapshot 'Name (PT-xxxx)'
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    doctor: { type: String, required: true },
    date: { type: Date, required: true },
    diagnosis: { type: String, required: true },
    medications: { type: [medicationSchema], required: true },
    notes: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'dispensed'], default: 'pending' },
    dispensedAt: { type: Date, default: null },
    dispensedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    inventoryDeductions: { type: [inventoryDeductionSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model('Prescription', prescriptionSchema);
