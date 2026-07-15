// Demo data mirrored from the frontend's mock constants (frontend/src/pages/*.jsx,
// frontend/src/context/AuthContext.jsx). Kept as plain data here — those frontend
// files don't export their constants, and once pages are wired to the API in later
// phases their local INITIAL_* arrays get removed entirely.

export const DEMO_USERS = [
  { name: 'Dr. Subhan Ahmed', email: 'admin@subhancare.pk', password: 'Admin@123', role: 'admin' },
  { name: 'Dr. Fatima Noor', email: 'doctor@subhancare.pk', password: 'Doctor@123', role: 'doctor', doctorId: 'DR-001' },
  { name: 'Sara Malik', email: 'receptionist@subhancare.pk', password: 'Recept@123', role: 'receptionist' },
  { name: 'Hassan Raza', email: 'pharmacist@subhancare.pk', password: 'Pharma@123', role: 'pharmacist' },
  { name: 'Aisha Butt', email: 'billing@subhancare.pk', password: 'Billing@123', role: 'billing' },
];

export const DOCTORS = [
  { doctorId: 'DR-001', name: 'Dr. Fatima Noor', specialty: 'Cardiology', qualification: 'MBBS, FCPS (Cardiology)', phone: '0300-1112233', email: 'fatima.noor@subhancare.pk', schedule: 'Mon, Wed, Fri', patients: 124, status: 'active', experience: '12 years' },
  { doctorId: 'DR-002', name: 'Dr. Usman Ali', specialty: 'Orthopedics', qualification: 'MBBS, MS (Ortho)', phone: '0321-4445566', email: 'usman.ali@subhancare.pk', schedule: 'Tue, Thu, Sat', patients: 89, status: 'active', experience: '8 years' },
  { doctorId: 'DR-003', name: 'Dr. Ayesha Tariq', specialty: 'Pediatrics', qualification: 'MBBS, DCH', phone: '0333-7778899', email: 'ayesha.tariq@subhancare.pk', schedule: 'Mon–Fri', patients: 201, status: 'active', experience: '15 years' },
  { doctorId: 'DR-004', name: 'Dr. Bilal Mahmood', specialty: 'Neurology', qualification: 'MBBS, FCPS (Neurology)', phone: '0311-0001122', email: 'bilal.mahmood@subhancare.pk', schedule: 'Mon, Thu', patients: 67, status: 'on-leave', experience: '6 years' },
  { doctorId: 'DR-005', name: 'Dr. Sana Riaz', specialty: 'Gynecology', qualification: 'MBBS, MRCOG', phone: '0345-3334455', email: 'sana.riaz@subhancare.pk', schedule: 'Tue, Wed, Fri', patients: 158, status: 'active', experience: '10 years' },
];

// PT-1001..PT-1003 mirror Patients.jsx exactly. PT-1004..PT-1007 fill in demographics
// for patients referenced by name only in Appointments/Prescriptions/Billing mock data
// (Patients.jsx has an unrelated, non-matching PT-1004+ series — see plan notes).
export const PATIENTS = [
  { patientId: 'PT-1001', name: 'Ahmed Khan', dob: '1985-05-12', age: 41, gender: 'Male', phone: '0300-1234567', cnic: '42101-1234567-1', address: 'Flat 402, Block C, Gulshan-e-Iqbal, Karachi', emergencyContact: 'Sara Khan (Wife) - 0300-9876543', lastVisit: '2026-06-28', registrationDate: '2026-01-15' },
  { patientId: 'PT-1002', name: 'Sara Malik', dob: '1992-08-23', age: 33, gender: 'Female', phone: '0321-7654321', cnic: '42201-9876543-2', address: 'House 42, Street 5, DHA Phase 6, Karachi', emergencyContact: 'Tariq Malik (Husband) - 0321-1122334', lastVisit: '2026-07-01', registrationDate: '2026-02-20' },
  { patientId: 'PT-1003', name: 'Hassan Raza', dob: '1978-11-04', age: 47, gender: 'Male', phone: '0333-5556667', cnic: '42301-5555555-5', address: 'Apartment B-12, Askari 4, Karachi', emergencyContact: 'Zubair Raza (Brother) - 0333-9998887', lastVisit: '2026-06-15', registrationDate: '2026-03-01' },
  { patientId: 'PT-1004', name: 'Maryam Iqbal', dob: '1989-01-30', age: 37, gender: 'Female', phone: '0334-1112223', cnic: '42101-1112223-4', address: 'House 17, PECHS Block 2, Karachi', emergencyContact: 'Iqbal Ahmed (Father) - 0334-4445556', lastVisit: '2026-07-03', registrationDate: '2026-01-28' },
  { patientId: 'PT-1005', name: 'Bilal Chaudhry', dob: '1980-04-17', age: 46, gender: 'Male', phone: '0335-2223334', cnic: '42101-2223334-5', address: 'House 9, Model Colony, Karachi', emergencyContact: 'Nadia Chaudhry (Wife) - 0335-5556667', lastVisit: '2026-07-04', registrationDate: '2026-02-10' },
  { patientId: 'PT-1006', name: 'Nida Hussain', dob: '1996-09-08', age: 29, gender: 'Female', phone: '0336-3334445', cnic: '42101-3334445-6', address: 'Flat 5B, North Nazimabad, Karachi', emergencyContact: 'Hussain Ali (Father) - 0336-6667778', lastVisit: '2026-07-04', registrationDate: '2026-03-22' },
  { patientId: 'PT-1007', name: 'Tariq Butt', dob: '1972-12-25', age: 53, gender: 'Male', phone: '0337-4445556', cnic: '42101-4445556-7', address: 'House 33, Garden East, Karachi', emergencyContact: 'Bushra Butt (Wife) - 0337-7778889', lastVisit: '2026-07-05', registrationDate: '2026-04-05' },
];

// Mirrors Appointments.jsx's INITIAL_APPTS. patientId/doctor are resolved to real
// ObjectId refs by seed.js at insert time.
export const APPOINTMENTS = [
  { apptId: 'APT-001', patientId: 'PT-1001', doctorId: 'DR-001', date: '2026-07-03', time: '09:00', type: 'Consultation', status: 'confirmed', notes: '' },
  { apptId: 'APT-002', patientId: 'PT-1002', doctorId: 'DR-002', date: '2026-07-03', time: '09:30', type: 'Follow-up', status: 'confirmed', notes: 'Post-op check' },
  { apptId: 'APT-003', patientId: 'PT-1003', doctorId: 'DR-003', date: '2026-07-03', time: '10:00', type: 'Check-up', status: 'pending', notes: '' },
  { apptId: 'APT-004', patientId: 'PT-1004', doctorId: 'DR-005', date: '2026-07-03', time: '11:00', type: 'Consultation', status: 'completed', notes: '' },
  { apptId: 'APT-005', patientId: 'PT-1005', doctorId: 'DR-001', date: '2026-07-04', time: '09:00', type: 'Emergency', status: 'pending', notes: 'Chest pain' },
  { apptId: 'APT-006', patientId: 'PT-1006', doctorId: 'DR-002', date: '2026-07-04', time: '10:30', type: 'Follow-up', status: 'cancelled', notes: '' },
  { apptId: 'APT-007', patientId: 'PT-1007', doctorId: 'DR-004', date: '2026-07-05', time: '14:00', type: 'Consultation', status: 'confirmed', notes: '' },
];

// Mirrors Prescriptions.jsx's INITIAL_RX.
export const PRESCRIPTIONS = [
  {
    rxId: 'RX-001', patientId: 'PT-1001', doctorId: 'DR-001', date: '2026-06-28',
    diagnosis: 'Hypertension, Hyperlipidaemia',
    medications: [
      { name: 'Aspirin', dosage: '75mg', frequency: 'Once daily', duration: 'Ongoing', instructions: 'Take after meal' },
      { name: 'Atorvastatin', dosage: '10mg', frequency: 'At night', duration: 'Ongoing', instructions: 'Avoid grapefruit' },
    ],
    notes: 'Monitor BP weekly', status: 'dispensed',
  },
  {
    rxId: 'RX-002', patientId: 'PT-1002', doctorId: 'DR-002', date: '2026-07-01',
    diagnosis: 'Post-operative pain management',
    medications: [{ name: 'Ibuprofen', dosage: '400mg', frequency: 'Twice daily', duration: '7 days', instructions: 'Take with food' }],
    notes: '', status: 'dispensed',
  },
  {
    rxId: 'RX-003', patientId: 'PT-1003', doctorId: 'DR-001', date: '2026-07-03',
    diagnosis: 'Viral upper respiratory infection',
    medications: [
      { name: 'Paracetamol', dosage: '500mg', frequency: 'Three times daily', duration: '5 days', instructions: 'Avoid alcohol' },
      { name: 'Chlorpheniramine', dosage: '4mg', frequency: 'Twice daily', duration: '5 days', instructions: 'May cause drowsiness' },
    ],
    notes: 'Rest advised, hydrate well', status: 'pending',
  },
];

// Mirrors MedicalHistory.jsx's INITIAL_HISTORY — chosen as canonical over
// Patients.jsx's embedded medicalHistory arrays (see plan notes: conflicting shapes/ids).
export const MEDICAL_HISTORY = [
  { entryId: 'MH-001', patientId: 'PT-1001', doctorId: 'DR-001', date: '2026-06-28', diagnosis: 'Hypertension', notes: 'Patient presented with mild chest tightness. ECG performed: normal sinus rhythm. Advised lifestyle changes and follow-up in 2 weeks.', timestamp: '2026-06-28T09:14:00' },
  { entryId: 'MH-002', patientId: 'PT-1001', doctorId: 'DR-002', date: '2026-03-10', diagnosis: 'Chronic Lower Back Pain', notes: 'Reviewed chronic back pain. Prescribed physiotherapy sessions and muscle relaxants. Avoid heavy lifting.', timestamp: '2026-03-10T11:32:00' },
  { entryId: 'MH-003', patientId: 'PT-1002', doctorId: 'DR-002', date: '2026-07-01', diagnosis: 'Ankle Fracture Recovery', notes: 'Post-op review of ankle fracture. Healing is on track. Cast removed. Referred to physical therapy for range of motion exercises.', timestamp: '2026-07-01T10:05:00' },
  { entryId: 'MH-004', patientId: 'PT-1004', doctorId: 'DR-005', date: '2026-06-15', diagnosis: 'Routine Gynaecological Checkup', notes: 'Annual examination completed. All parameters within normal limits. Next checkup in 12 months.', timestamp: '2026-06-15T14:20:00' },
];

// Mirrors Inventory.jsx's INITIAL_INVENTORY. `status` is omitted — the InventoryItem
// model's pre('save') hook derives it from quantity/reorderLevel.
export const INVENTORY = [
  { itemId: 'MED-001', name: 'Paracetamol 500mg', category: 'Analgesics', unit: 'Tablets', quantity: 450, reorderLevel: 100, rate: 2.5, supplier: 'MediPak Ltd', expiry: '2027-12-31' },
  { itemId: 'MED-002', name: 'Amoxicillin 500mg', category: 'Antibiotics', unit: 'Capsules', quantity: 80, reorderLevel: 100, rate: 15, supplier: 'PharmaCorp', expiry: '2026-11-30' },
  { itemId: 'MED-003', name: 'Atorvastatin 10mg', category: 'Antihypertensives', unit: 'Tablets', quantity: 200, reorderLevel: 50, rate: 8, supplier: 'GenMed', expiry: '2027-06-30' },
  { itemId: 'MED-004', name: 'Normal Saline 0.9%', category: 'IV Fluids', unit: 'Bottles', quantity: 15, reorderLevel: 30, rate: 80, supplier: 'IVPak', expiry: '2027-03-31' },
  { itemId: 'MED-005', name: 'Insulin Glargine', category: 'Antidiabetics', unit: 'Vials', quantity: 0, reorderLevel: 10, rate: 450, supplier: 'NovoNord', expiry: '2026-09-30' },
  { itemId: 'MED-006', name: 'Vitamin C 500mg', category: 'Vitamins', unit: 'Tablets', quantity: 600, reorderLevel: 100, rate: 3, supplier: 'VitaCare', expiry: '2028-01-31' },
];

// Mirrors billingData.js's INITIAL_INVOICES.
export const INVOICES = [
  { invoiceId: 'INV-001', patientId: 'PT-1001', date: '2026-06-28', dueDate: '2026-07-05', services: [{ name: 'Consultation Fee', qty: 1, rate: 1500 }, { name: 'ECG', qty: 1, rate: 800 }], discount: 0, paid: 2300 },
  { invoiceId: 'INV-002', patientId: 'PT-1002', date: '2026-07-01', dueDate: '2026-07-08', services: [{ name: 'X-Ray', qty: 2, rate: 1200 }, { name: 'Physiotherapy Session', qty: 3, rate: 900 }], discount: 500, paid: 2000 },
  { invoiceId: 'INV-003', patientId: 'PT-1003', date: '2026-07-03', dueDate: '2026-07-10', services: [{ name: 'Consultation Fee', qty: 1, rate: 1500 }, { name: 'Blood Test', qty: 1, rate: 600 }], discount: 0, paid: 0 },
  { invoiceId: 'INV-004', patientId: 'PT-1004', date: '2026-06-20', dueDate: '2026-06-27', services: [{ name: 'Consultation Fee', qty: 1, rate: 1500 }], discount: 0, paid: 0 },
];
