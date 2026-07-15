import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    apptId: { type: String, required: true, unique: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    patientName: { type: String, required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    doctor: { type: String, required: true },
    date: { type: String, required: true }, // 'YYYY-MM-DD', matches frontend string comparisons
    time: { type: String, required: true },
    type: { type: String, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('Appointment', appointmentSchema);
