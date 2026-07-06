import { useState, useRef } from 'react';
import {
  Plus, Search, ChevronDown, X,
  Printer, CheckCircle2, AlertTriangle, DollarSign, CreditCard,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import EmptyState from '../components/EmptyState';
import InvoiceModal from '../components/InvoiceModal';
import PaymentModal from '../components/PaymentModal';
import useToast from '../hooks/useToast';
import {
  INITIAL_INVOICES,
  STATUS_META,
  subtotalOf as subtotal,
  totalOf as total,
  outstandingOf as outstanding,
} from '../constants/billingData';
import './Billing.css';

const PrintModal = ({ invoice, onClose }) => {
  const handlePrint = () => window.print();

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box modal-box--lg print-invoice">
        <div className="modal-header no-print">
          <h2>Invoice Preview — {invoice.id}</h2>
          <div className="modal-header-actions">
            <button className="btn btn-ghost" onClick={onClose}>Close</button>
            <button className="btn btn-primary" onClick={handlePrint}>
              <Printer size={15} aria-hidden="true" /> Print
            </button>
          </div>
        </div>
        <div className="invoice-print-body">
          <div className="invoice-print-header">
            <div><h1>Subhan Care Hospital</h1><p>Invoice / Receipt</p></div>
            <div className="invoice-print-meta">
              <p><strong>{invoice.id}</strong></p>
              <p>Date: {invoice.date}</p>
              <p>Due: {invoice.dueDate}</p>
            </div>
          </div>
          <p className="invoice-print-patient"><strong>Patient:</strong> {invoice.patient.split(' (')[0]}</p>
          <table className="data-table invoice-table">
            <thead>
              <tr><th>Service</th><th>Qty</th><th>Rate</th><th>Amount</th></tr>
            </thead>
            <tbody>
              {invoice.services.map((s, i) => (
                <tr key={i}>
                  <td>{s.name}</td>
                  <td>{s.qty}</td>
                  <td>Rs. {Number(s.rate).toLocaleString()}</td>
                  <td>Rs. {(s.qty * s.rate).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="invoice-totals invoice-totals--print">
            <div className="total-row"><span>Subtotal</span><span>Rs. {subtotal(invoice).toLocaleString()}</span></div>
            {invoice.discount > 0 && (
              <div className="total-row"><span>Discount</span><span>– Rs. {invoice.discount.toLocaleString()}</span></div>
            )}
            <div className="total-row total-row--final"><span>Total</span><span>Rs. {total(invoice).toLocaleString()}</span></div>
            <div className="total-row"><span>Paid</span><span>Rs. {invoice.paid.toLocaleString()}</span></div>
            <div className="total-row total-row--outstanding"><span>Outstanding</span><span>Rs. {outstanding(invoice).toLocaleString()}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Billing = () => {
  const { role } = useAuth();
  const hasAccess = role === 'admin' || role === 'billing';

  const [invoices, setInvoices] = useState(INITIAL_INVOICES);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modal, setModal] = useState(null);
  const { toast, showToast } = useToast();

  if (!hasAccess) return (
    <div className="page-centered">
      <EmptyState icon={CreditCard} message="You do not have access to Billing & Payments." />
    </div>
  );

  const filtered = invoices.filter((inv) => {
    const q = search.toLowerCase();
    return (inv.patient.toLowerCase().includes(q) || inv.id.toLowerCase().includes(q)) &&
           (!filterStatus || inv.status === filterStatus);
  });

  const todayRevenue = invoices.reduce((sum, inv) => sum + (inv.paid || 0), 0);
  const overdueCount = invoices.filter(inv => inv.status === 'overdue').length;
  const unpaidOutstanding = invoices.filter(inv => inv.status !== 'paid').reduce((s, inv) => s + outstanding(inv), 0);

  const handleCreateInvoice = (form) => {
    const id = `INV-${String(invoices.length + 1).padStart(3, '0')}`;
    setInvoices((prev) => [...prev, { ...form, id }]);
    showToast('Invoice created.');
    setModal(null);
  };

  const handleRecordPayment = (inv, amount) => {
    setInvoices((prev) => prev.map((i) => {
      if (i.id !== inv.id) return i;
      const newPaid = (i.paid || 0) + amount;
      return { ...i, paid: newPaid, status: newPaid >= total(i) ? 'paid' : 'partial' };
    }));
    showToast(`Payment of Rs. ${amount.toLocaleString()} recorded.`);
    setModal(null);
  };

  return (
    <div className="billing-page">
      {overdueCount > 0 && (
        <div className="alert-banner alert-banner--warning">
          <AlertTriangle size={16} />
          {overdueCount} overdue invoice{overdueCount > 1 ? 's' : ''} require immediate attention.
        </div>
      )}

      <div className="billing-kpis">
        <div className="billing-kpi">
          <div className="billing-kpi-icon billing-kpi-icon--success"><DollarSign size={18} aria-hidden="true" /></div>
          <div>
            <p className="billing-kpi-label">Total Collected</p>
            <p className="billing-kpi-value">Rs. {todayRevenue.toLocaleString()}</p>
          </div>
        </div>
        <div className="billing-kpi">
          <div className="billing-kpi-icon billing-kpi-icon--warning"><CreditCard size={18} aria-hidden="true" /></div>
          <div>
            <p className="billing-kpi-label">Outstanding</p>
            <p className="billing-kpi-value">Rs. {unpaidOutstanding.toLocaleString()}</p>
          </div>
        </div>
        <div className="billing-kpi">
          <div className="billing-kpi-icon billing-kpi-icon--danger"><AlertTriangle size={18} aria-hidden="true" /></div>
          <div>
            <p className="billing-kpi-label">Overdue</p>
            <p className="billing-kpi-value">{overdueCount} invoice{overdueCount !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      <div className="page-header">
        <div>
          <h2>Invoices</h2>
          <p className="page-subtitle">{invoices.length} total · {invoices.filter(i => i.status === 'paid').length} paid</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({ type: 'create' })}>
          <Plus size={16} /> Create Invoice
        </button>
      </div>

      <div className="table-controls">
        <div className="search-box">
          <Search size={16} />
          <input
            type="search"
            placeholder="Search by patient or invoice ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search invoices"
          />
        </div>
        <div className="filter-group">
          <ChevronDown size={14} className="filter-icon" />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} aria-label="Filter by status">
            <option value="">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="unpaid">Unpaid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        {filtered.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            message="No invoices match your search."
            actionLabel="Clear Filters"
            onAction={() => { setSearch(''); setFilterStatus(''); }}
          />
        ) : (
          <table className="data-table" aria-label="Invoices">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Patient</th>
                <th>Date</th>
                <th>Due Date</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Outstanding</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => {
                const tot = total(inv);
                const owed = outstanding(inv);
                const meta = STATUS_META[inv.status] || STATUS_META.unpaid;
                return (
                  <tr key={inv.id} className={inv.status === 'overdue' ? 'tr--overdue' : ''}>
                    <td><span className="inv-id">{inv.id}</span></td>
                    <td className="cell-bold">{inv.patient.split(' (')[0]}</td>
                    <td className="text-muted">{inv.date}</td>
                    <td className={inv.status === 'overdue' ? 'text-danger' : 'text-muted'}>{inv.dueDate}</td>
                    <td className="cell-bold">Rs. {tot.toLocaleString()}</td>
                    <td className="text-secondary">Rs. {inv.paid.toLocaleString()}</td>
                    <td className={owed > 0 ? 'amount-outstanding' : 'amount-cleared'}>Rs. {owed.toLocaleString()}</td>
                    <td><span className={`badge ${meta.cls}`}>{meta.label}</span></td>
                    <td>
                      <div className="action-btns">
                        <button
                          className="icon-btn"
                          title="View / Print Invoice"
                          onClick={() => setModal({ type: 'print', data: inv })}
                          aria-label="Print invoice"
                        >
                          <Printer size={15} />
                        </button>
                        {inv.status !== 'paid' && (
                          <button
                            className="icon-btn icon-btn--success"
                            title="Record Payment"
                            onClick={() => setModal({ type: 'payment', data: inv })}
                            aria-label="Record payment"
                          >
                            <CheckCircle2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {modal?.type === 'create'  && <InvoiceModal onClose={() => setModal(null)} onSave={handleCreateInvoice} />}
      {modal?.type === 'payment' && (
        <PaymentModal
          invoice={modal.data}
          onClose={() => setModal(null)}
          onRecord={(amt) => handleRecordPayment(modal.data, amt)}
        />
      )}
      {modal?.type === 'print'   && <PrintModal invoice={modal.data} onClose={() => setModal(null)} />}

      {toast && <div className="toast toast--success" role="status">{toast}</div>}
    </div>
  );
};

export default Billing;
