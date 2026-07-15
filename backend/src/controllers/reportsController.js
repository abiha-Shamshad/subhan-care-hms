import Invoice from '../models/Invoice.js';
import InventoryItem from '../models/InventoryItem.js';
import Prescription from '../models/Prescription.js';
import Appointment from '../models/Appointment.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const dateRange = (query) => ({
  from: query.from ? new Date(query.from) : new Date(new Date().setDate(new Date().getDate() - 30)),
  to: query.to ? new Date(query.to) : new Date(),
});

export const getRevenueReport = asyncHandler(async (req, res) => {
  const { from, to } = dateRange(req.query);

  const invoices = await Invoice.find({ date: { $gte: from, $lte: to } });
  const buckets = new Map();
  for (const inv of invoices) {
    const key = formatDate(inv.date, req.query.groupBy || 'day');
    const billed = inv.services.reduce((s, x) => s + x.qty * x.rate, 0) - (inv.discount || 0);
    const collected = inv.paid || 0;
    const entry = buckets.get(key) || { period: key, billed: 0, collected: 0 };
    entry.billed += billed;
    entry.collected += collected;
    buckets.set(key, entry);
  }

  res.json({ series: [...buckets.values()].sort((a, b) => a.period.localeCompare(b.period)) });
});

function formatDate(date, groupBy) {
  const d = new Date(date);
  if (groupBy === 'month') return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  if (groupBy === 'week') {
    const firstDay = new Date(d);
    firstDay.setDate(d.getDate() - d.getDay());
    return firstDay.toISOString().split('T')[0];
  }
  return d.toISOString().split('T')[0];
}

export const getInventoryUsageReport = asyncHandler(async (req, res) => {
  const items = await InventoryItem.find();

  const byCategory = new Map();
  for (const item of items) {
    const entry = byCategory.get(item.category) || { category: item.category, quantity: 0, value: 0 };
    entry.quantity += item.quantity;
    entry.value += item.quantity * item.rate;
    byCategory.set(item.category, entry);
  }

  const lowStock = items
    .filter((i) => i.status === 'low-stock' || i.status === 'out-of-stock')
    .map((i) => ({ itemId: i.itemId, name: i.name, quantity: i.quantity, reorderLevel: i.reorderLevel, status: i.status }));

  res.json({ byCategory: [...byCategory.values()], lowStock });
});

export const getPrescriptionTrendsReport = asyncHandler(async (req, res) => {
  const { from, to } = dateRange(req.query);
  const prescriptions = await Prescription.find({ date: { $gte: from, $lte: to } });

  const byDate = new Map();
  const medCounts = new Map();
  for (const rx of prescriptions) {
    const key = formatDate(rx.date, 'day');
    const entry = byDate.get(key) || { date: key, issued: 0, dispensed: 0 };
    entry.issued += 1;
    if (rx.status === 'dispensed') entry.dispensed += 1;
    byDate.set(key, entry);

    for (const med of rx.medications) {
      medCounts.set(med.name, (medCounts.get(med.name) || 0) + 1);
    }
  }

  const topMedications = [...medCounts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  res.json({ series: [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date)), topMedications });
});

export const getAppointmentLoadReport = asyncHandler(async (req, res) => {
  const { from, to } = dateRange(req.query);
  const fromStr = from.toISOString().split('T')[0];
  const toStr = to.toISOString().split('T')[0];
  const appointments = await Appointment.find({ date: { $gte: fromStr, $lte: toStr } });

  const byDate = new Map();
  const byStatus = new Map();
  for (const a of appointments) {
    byDate.set(a.date, (byDate.get(a.date) || 0) + 1);
    byStatus.set(a.status, (byStatus.get(a.status) || 0) + 1);
  }

  res.json({
    byDate: [...byDate.entries()].map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date)),
    byStatus: [...byStatus.entries()].map(([status, count]) => ({ status, count })),
  });
});
