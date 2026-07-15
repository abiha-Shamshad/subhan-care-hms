import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema(
  {
    doctorId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    specialty: { type: String, required: true },
    qualification: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    schedule: { type: String, default: '' },
    experience: { type: String, default: '' },
    patients: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'on-leave'], default: 'active' },
  },
  { timestamps: true }
);

export default mongoose.model('Doctor', doctorSchema);
