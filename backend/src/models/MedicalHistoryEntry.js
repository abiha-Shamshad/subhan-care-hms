import mongoose from 'mongoose';

const medicalHistoryEntrySchema = new mongoose.Schema(
  {
    entryId: { type: String, required: true, unique: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    doctor: { type: String, required: true },
    date: { type: Date, required: true },
    diagnosis: { type: String, required: true },
    notes: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

// Medical history is append-only: no route ever calls update/delete, but guard
// at the schema level too in case a future change adds one by mistake.
const immutableError = () => {
  throw new Error('Medical history entries are immutable and cannot be modified or deleted.');
};
medicalHistoryEntrySchema.pre('findOneAndUpdate', immutableError);
medicalHistoryEntrySchema.pre('updateOne', immutableError);
medicalHistoryEntrySchema.pre('deleteOne', immutableError);
medicalHistoryEntrySchema.pre('findOneAndDelete', immutableError);

export default mongoose.model('MedicalHistoryEntry', medicalHistoryEntrySchema);
