/* =============================================
   DASHBOARD MOCK DATA
   Realistic data for a mid-sized hospital.
   Replace with API calls from services/ later.
   ============================================= */

export const KPI_DATA = {
  totalPatients: {
    value: 2847,
    trend: { value: 12.5, isPositive: true },
  },
  todayAppointments: {
    value: 48,
    trend: { value: 8.2, isPositive: true },
  },
  activeDoctors: {
    value: 18,
    trend: { value: 0, isPositive: true },
  },
  pendingBills: {
    value: 23,
    trend: { value: 4.1, isPositive: false },
  },
};

export const TODAY_APPOINTMENTS = [
  {
    id: 1,
    time: '09:00 AM',
    patientName: 'Ahmed Khan',
    doctorName: 'Dr. Fatima Noor',
    status: 'confirmed',
  },
  {
    id: 2,
    time: '09:30 AM',
    patientName: 'Sara Malik',
    doctorName: 'Dr. Usman Ali',
    status: 'confirmed',
  },
  {
    id: 3,
    time: '10:00 AM',
    patientName: 'Hassan Raza',
    doctorName: 'Dr. Ayesha Tariq',
    status: 'pending',
  },
  {
    id: 4,
    time: '10:30 AM',
    patientName: 'Zainab Bibi',
    doctorName: 'Dr. Kamran Shah',
    status: 'confirmed',
  },
  {
    id: 5,
    time: '11:00 AM',
    patientName: 'Bilal Hussain',
    doctorName: 'Dr. Fatima Noor',
    status: 'cancelled',
  },
  {
    id: 6,
    time: '11:30 AM',
    patientName: 'Maryam Sheikh',
    doctorName: 'Dr. Usman Ali',
    status: 'pending',
  },
  {
    id: 7,
    time: '02:00 PM',
    patientName: 'Ali Raza',
    doctorName: 'Dr. Ayesha Tariq',
    status: 'confirmed',
  },
  {
    id: 8,
    time: '03:00 PM',
    patientName: 'Nadia Perveen',
    doctorName: 'Dr. Kamran Shah',
    status: 'confirmed',
  },
];

export const WEEKLY_APPOINTMENTS = [
  { day: 'Mon', count: 42 },
  { day: 'Tue', count: 38 },
  { day: 'Wed', count: 55 },
  { day: 'Thu', count: 47 },
  { day: 'Fri', count: 32 },
  { day: 'Sat', count: 28 },
  { day: 'Sun', count: 48 },
];

export const MONTHLY_REVENUE = [
  { month: 'Jan', revenue: 425000 },
  { month: 'Feb', revenue: 510000 },
  { month: 'Mar', revenue: 478000 },
  { month: 'Apr', revenue: 560000 },
  { month: 'May', revenue: 620000 },
  { month: 'Jun', revenue: 580000 },
  { month: 'Jul', revenue: 695000 },
];

export const BILLING_STATS = {
  totalRevenue: 695000,
  outstandingInvoices: 23,
};

export const LOW_STOCK_ITEMS = [
  {
    id: 1,
    name: 'Paracetamol 500mg',
    currentStock: 45,
    threshold: 200,
    unit: 'tablets',
  },
  {
    id: 2,
    name: 'Surgical Gloves (M)',
    currentStock: 30,
    threshold: 100,
    unit: 'pairs',
  },
  {
    id: 3,
    name: 'IV Cannula 20G',
    currentStock: 12,
    threshold: 50,
    unit: 'pieces',
  },
  {
    id: 4,
    name: 'Amoxicillin 250mg',
    currentStock: 80,
    threshold: 150,
    unit: 'capsules',
  },
  {
    id: 5,
    name: 'Disposable Syringes 5ml',
    currentStock: 5,
    threshold: 100,
    unit: 'pieces',
  },
  {
    id: 6,
    name: 'Bandage Roll 4"',
    currentStock: 18,
    threshold: 60,
    unit: 'rolls',
  },
];

export const STAFF_DATA = {
  onDuty: 18,
  offDuty: 7,
  staffList: [
    { name: 'Dr. Fatima Noor', role: 'Cardiologist', isOnDuty: true },
    { name: 'Dr. Usman Ali', role: 'Orthopedic', isOnDuty: true },
    { name: 'Dr. Ayesha Tariq', role: 'Pediatrician', isOnDuty: true },
    { name: 'Dr. Kamran Shah', role: 'Neurologist', isOnDuty: true },
    { name: 'Nurse Hina Saeed', role: 'Head Nurse', isOnDuty: true },
    { name: 'Nurse Asma Javed', role: 'ICU Nurse', isOnDuty: true },
    { name: 'Dr. Imran Qureshi', role: 'Surgeon', isOnDuty: false },
    { name: 'Dr. Sadia Mumtaz', role: 'Dermatologist', isOnDuty: false },
    { name: 'Nurse Rabia Nawaz', role: 'Ward Nurse', isOnDuty: true },
    { name: 'Dr. Tariq Mehmood', role: 'ENT Specialist', isOnDuty: false },
  ],
};

export const RECENT_ACTIVITIES = [
  {
    id: 1,
    user: 'Dr. Fatima Noor',
    action: 'Updated patient record for Ahmed Khan',
    module: 'Patients',
    timestamp: '2 min ago',
  },
  {
    id: 2,
    user: 'Admin Subhan',
    action: 'Generated monthly billing report',
    module: 'Billing',
    timestamp: '15 min ago',
  },
  {
    id: 3,
    user: 'Nurse Hina',
    action: 'Marked IV Cannula 20G as low stock',
    module: 'Inventory',
    timestamp: '32 min ago',
  },
  {
    id: 4,
    user: 'Dr. Usman Ali',
    action: 'Confirmed appointment with Sara Malik',
    module: 'Appointments',
    timestamp: '1 hour ago',
  },
  {
    id: 5,
    user: 'Admin Subhan',
    action: 'Added new staff member: Dr. Sobia Anwar',
    module: 'Staff',
    timestamp: '2 hours ago',
  },
  {
    id: 6,
    user: 'Dr. Ayesha Tariq',
    action: 'Prescribed medication for Hassan Raza',
    module: 'Patients',
    timestamp: '3 hours ago',
  },
  {
    id: 7,
    user: 'Receptionist Aliya',
    action: 'Registered new patient: Maryam Sheikh',
    module: 'Patients',
    timestamp: '3 hours ago',
  },
  {
    id: 8,
    user: 'Admin Subhan',
    action: 'Updated billing for Room 204',
    module: 'Billing',
    timestamp: '4 hours ago',
  },
  {
    id: 9,
    user: 'Nurse Asma',
    action: 'Updated inventory: received surgical gloves',
    module: 'Inventory',
    timestamp: '5 hours ago',
  },
  {
    id: 10,
    user: 'Dr. Kamran Shah',
    action: 'Cancelled appointment with Bilal Hussain',
    module: 'Appointments',
    timestamp: '6 hours ago',
  },
];
