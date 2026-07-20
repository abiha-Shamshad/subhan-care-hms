import { subtotalOf, totalOf, deriveInvoiceStatus } from '../src/utils/invoiceMath.js';

describe('invoiceMath', () => {
  const baseInvoice = { services: [{ qty: 2, rate: 500 }, { qty: 1, rate: 1000 }], discount: 200 };

  it('subtotalOf sums qty * rate across services', () => {
    expect(subtotalOf(baseInvoice)).toBe(2000);
  });

  it('totalOf subtracts the discount from the subtotal', () => {
    expect(totalOf(baseInvoice)).toBe(1800);
  });

  it('deriveInvoiceStatus returns paid when fully settled', () => {
    const inv = { ...baseInvoice, paid: 1800, dueDate: '2099-01-01' };
    expect(deriveInvoiceStatus(inv)).toBe('paid');
  });

  it('deriveInvoiceStatus returns overdue when unpaid past the due date', () => {
    const inv = { ...baseInvoice, paid: 0, dueDate: '2000-01-01' };
    expect(deriveInvoiceStatus(inv)).toBe('overdue');
  });

  it('deriveInvoiceStatus returns partial when some but not all is paid', () => {
    const inv = { ...baseInvoice, paid: 500, dueDate: '2099-01-01' };
    expect(deriveInvoiceStatus(inv)).toBe('partial');
  });

  it('deriveInvoiceStatus returns unpaid when nothing is paid and not overdue', () => {
    const inv = { ...baseInvoice, paid: 0, dueDate: '2099-01-01' };
    expect(deriveInvoiceStatus(inv)).toBe('unpaid');
  });
});
