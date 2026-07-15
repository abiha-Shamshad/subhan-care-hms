export const subtotalOf = (inv) => inv.services.reduce((sum, s) => sum + s.qty * s.rate, 0);
export const totalOf = (inv) => subtotalOf(inv) - (inv.discount || 0);

export const deriveInvoiceStatus = (invoice) => {
  const total = totalOf(invoice);
  if (invoice.paid >= total && total > 0) return 'paid';
  if (new Date(invoice.dueDate) < new Date() && invoice.paid < total) return 'overdue';
  if (invoice.paid > 0) return 'partial';
  return 'unpaid';
};
