import { useState } from 'react';
import {
  Plus, Search, ChevronDown, X,
  Printer, CheckCircle2, AlertTriangle, DollarSign, CreditCard, CalendarCheck, Download,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import InvoiceModal from '../components/InvoiceModal';
import PaymentModal from '../components/PaymentModal';
import useToast from '../hooks/useToast';
import useApiResource from '../hooks/useApiResource';
import useTableFilters from '../hooks/useTableFilters';
import { invoiceService, patientService, appointmentService } from '../services/api';
import { generateInvoicePdf } from '../utils/pdf';
import {
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
          <h2>Invoice Preview — {invoice.invoiceId}</h2>
          <div className="modal-header-actions">
            <button className="btn btn-ghost" onClick={onClose}>Close</button>
            <button className="btn btn-ghost" onClick={() => generateInvoicePdf(invoice)}>
              <Download size={15} aria-hidden="true" /> Download PDF
            </button>
            <button className="btn btn-primary" onClick={handlePrint}>
              <Printer size={15} aria-hidden="true" /> Print
            </button>
          </div>
        </div>
        <div className="invoice-print-body">
          <div className="invoice-print-header">
            <div><h1>Subhan Care Hospital</h1><p>Invoice / Receipt</p></div>
            <div className="invoice-print-meta">
              <p><strong>{invoice.invoiceId}</strong></p>
              <p>Date: {new Date(invoice.date).toLocaleDateString('en-CA')}</p>
              <p>Due: {new Date(invoice.dueDate).toLocaleDateString('en-CA')}</p>
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

/** Lets billing staff pick a completed appointment to pre-fill a new invoice from. */
const AppointmentPickerModal = ({ appointments, onClose, onPick }) => (
  <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="appt-pick-title" onClick={(e) => e.target === e.currentTarget && onClose()}>
    <div className="modal-box">
      <div className="modal-header">
        <h2 id="appt-pick-title">New Invoice from Appointment</h2>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close"><X size={20} /></button>
      </div>
      <div className="modal-form">
        {appointments.length === 0 ? (
          <EmptyState icon={CalendarCheck} message="No completed appointments available to bill." />
        ) : (
          <ul className="mh-patient-list">
            {appointments.map((a) => (
              <li key={a.apptId}>
                <button className="mh-patient-item" onClick={() => onPick(a)}>
                  <div className="mh-patient-avatar">{a.patientName.split(' ').map(w => w[0]).join('').slice(0, 2)}</div>
                  <div className="mh-patient-info">
                    <span className="mh-patient-name">{a.patientName}</span>
                    <span className="mh-patient-sub">{a.doctor} · {a.type} · {a.date}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  </div>
);

const Billing = () => {
  const { role } = useAuth();
  const hasAccess = role === 'admin' || role === 'billing';

  const { data: invoiceData, loading, error, refetch } = useApiResource(() => (hasAccess ? invoiceService.getAll() : Promise.resolve([])), [hasAccess]);
  const { data: patientData } = useApiResource(() => (hasAccess ? patientService.getAll() : Promise.resolve([])), [hasAccess]);
  const [modal, setModal] = useState(null);
  const { toast, showToast } = useToast();

  const invoices = invoiceData || [];
  const patients = patientData || [];

  const {
    filtered, search, setSearch, filterValues, setFilter, dateFrom, setDateFrom, dateTo, setDateTo, clearAll,
  } = useTableFilters(invoices, {
    searchFields: [(inv) => inv.patient, (inv) => inv.invoiceId, (inv) => inv.services.map(s => s.name).join(' ')],
    filters: { status: (inv) => inv.status },
    dateField: (inv) => new Date(inv.date).toISOString().split('T')[0],
  });

  if (!hasAccess) return (
    <div className="page-centered">
      <EmptyState icon={CreditCard} message="You do not have access to Billing & Payments." />
    </div>
  );

  const todayRevenue = invoices.reduce((sum, inv) => sum + (inv.paid || 0), 0);
  const overdueCount = invoices.filter(inv => inv.status === 'overdue').length;
  const unpaidOutstanding = invoices.filter(inv => inv.status !== 'paid').reduce((s, inv) => s + outstanding(inv), 0);

  const handleCreateInvoice = async (form) => {
    try {
      await invoiceService.create({
        patientId: form.patientId,
        appointmentId: form.appointmentId || undefined,
        date: form.date,
        dueDate: form.dueDate,
        services: form.services.map(s => ({ name: s.name, qty: Number(s.qty), rate: Number(s.rate) })),
        discount: form.discount,
      });
      await refetch();
      showToast('Invoice created.');
      setModal(null);
    } catch (err) {
      showToast(err.message || 'Failed to create invoice.');
    }
  };

  const handleRecordPayment = async (inv, amount, method) => {
    try {
      await invoiceService.recordPayment(inv.invoiceId, { amount, method });
      await refetch();
      showToast(`Payment of Rs. ${amount.toLocaleString()} recorded.`);
      setModal(null);
    } catch (err) {
      showToast(err.message || 'Failed to record payment.');
    }
  };

  const openFromAppointment = async () => {
    try {
      const completed = await appointmentService.getAll({ status: 'completed' });
      setModal({ type: 'pick-appointment', data: completed });
    } catch (err) {
      showToast(err.message || 'Failed to load completed appointments.');
    }
  };

  const handlePickAppointment = async (appt) => {
    try {
      const draft = await invoiceService.fromAppointment(appt.apptId);
      setModal({ type: 'create', data: draft });
    } catch (err) {
      showToast(err.message || 'Failed to prepare invoice from appointment.');
    }
  };

  if (loading) {
    return (
      <div className="billing-page" aria-busy="true" aria-label="Loading…">
        {[1, 2, 3].map(n => (
          <div key={n} className="skeleton-row">
            <LoadingSkeleton variant="text" width="120px" />
            <LoadingSkeleton variant="text" width="200px" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-centered">
        <EmptyState icon={CreditCard} message={error} actionLabel="Retry" onAction={refetch} />
      </div>
    );
  }

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
        <div className="appt-header-actions">
          <button className="btn btn-ghost" onClick={openFromAppointment}>
            <CalendarCheck size={16} /> From Appointment
          </button>
          <button className="btn btn-primary" onClick={() => setModal({ type: 'create' })}>
            <Plus size={16} /> Create Invoice
          </button>
        </div>
      </div>

      <div className="table-controls">
        <div className="search-box">
          <Search size={16} />
          <input
            type="search"
            placeholder="Search by patient, invoice ID, or service…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search invoices"
          />
        </div>
        <div className="filter-group">
          <ChevronDown size={14} className="filter-icon" />
          <select value={filterValues.status} onChange={(e) => setFilter('status', e.target.value)} aria-label="Filter by status">
            <option value="">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="unpaid">Unpaid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
        <div className="filter-group date-range-group">
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} aria-label="From date" />
          <span className="text-muted">to</span>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} aria-label="To date" />
        </div>
      </div>

      <div className="table-container">
        {filtered.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            message="No invoices match your search."
            actionLabel="Clear Filters"
            onAction={clearAll}
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
                  <tr key={inv.invoiceId} className={inv.status === 'overdue' ? 'tr--overdue' : ''}>
                    <td><span className="inv-id">{inv.invoiceId}</span></td>
                    <td className="cell-bold">{inv.patient.split(' (')[0]}</td>
                    <td className="text-muted">{new Date(inv.date).toLocaleDateString('en-CA')}</td>
                    <td className={inv.status === 'overdue' ? 'text-danger' : 'text-muted'}>{new Date(inv.dueDate).toLocaleDateString('en-CA')}</td>
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

      {modal?.type === 'create'  && <InvoiceModal patients={patients} initialValues={modal.data} onClose={() => setModal(null)} onSave={handleCreateInvoice} />}
      {modal?.type === 'pick-appointment' && (
        <AppointmentPickerModal appointments={modal.data} onClose={() => setModal(null)} onPick={handlePickAppointment} />
      )}
      {modal?.type === 'payment' && (
        <PaymentModal
          invoice={modal.data}
          onClose={() => setModal(null)}
          onRecord={(amt, method) => handleRecordPayment(modal.data, amt, method)}
        />
      )}
      {modal?.type === 'print'   && <PrintModal invoice={modal.data} onClose={() => setModal(null)} />}

      {toast && <div className="toast toast--success" role="status">{toast}</div>}
    </div>
  );
};

export default Billing;
