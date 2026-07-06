/** @fileoverview Shared billing constants and pure helpers used by Billing and BillingDashboard. */

export const PATIENTS = [
  'Ahmed Khan (PT-1001)',
  'Sara Malik (PT-1002)',
  'Hassan Raza (PT-1003)',
  'Maryam Iqbal (PT-1004)',
];

export const PAYMENT_METHODS = ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Insurance'];

export const SERVICE_CATALOG = [
  'Consultation Fee', 'ECG', 'X-Ray', 'Blood Test', 'Ultrasound',
  'Physiotherapy Session', 'Medication', 'Procedure', 'Emergency Charge',
];

/** @type {import('../types').Invoice[]} */
export const INITIAL_INVOICES = [
  {
    id: 'INV-001',
    patient: 'Ahmed Khan (PT-1001)',
    date: '2026-06-28',
    dueDate: '2026-07-05',
    services: [
      { name: 'Consultation Fee', qty: 1, rate: 1500 },
      { name: 'ECG', qty: 1, rate: 800 },
    ],
    discount: 0,
    paid: 2300,
    status: 'paid',
  },
  {
    id: 'INV-002',
    patient: 'Sara Malik (PT-1002)',
    date: '2026-07-01',
    dueDate: '2026-07-08',
    services: [
      { name: 'X-Ray', qty: 2, rate: 1200 },
      { name: 'Physiotherapy Session', qty: 3, rate: 900 },
    ],
    discount: 500,
    paid: 2000,
    status: 'partial',
  },
  {
    id: 'INV-003',
    patient: 'Hassan Raza (PT-1003)',
    date: '2026-07-03',
    dueDate: '2026-07-10',
    services: [
      { name: 'Consultation Fee', qty: 1, rate: 1500 },
      { name: 'Blood Test', qty: 1, rate: 600 },
    ],
    discount: 0,
    paid: 0,
    status: 'unpaid',
  },
  {
    id: 'INV-004',
    patient: 'Maryam Iqbal (PT-1004)',
    date: '2026-06-20',
    dueDate: '2026-06-27',
    services: [
      { name: 'Consultation Fee', qty: 1, rate: 1500 },
    ],
    discount: 0,
    paid: 0,
    status: 'overdue',
  },
];

export const STATUS_META = {
  paid:    { label: 'Paid',    cls: 'badge--green' },
  partial: { label: 'Partial', cls: 'badge--blue'  },
  unpaid:  { label: 'Unpaid',  cls: 'badge--amber' },
  overdue: { label: 'Overdue', cls: 'badge--red'   },
};

/** @param {import('../types').Invoice} inv */
export const subtotalOf = (inv) => inv.services.reduce((sum, s) => sum + s.qty * s.rate, 0);

/** @param {import('../types').Invoice} inv */
export const totalOf = (inv) => subtotalOf(inv) - (inv.discount || 0);

/** @param {import('../types').Invoice} inv */
export const outstandingOf = (inv) => Math.max(0, totalOf(inv) - (inv.paid || 0));
