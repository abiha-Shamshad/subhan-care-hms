import { useState, useRef } from 'react';
import {
  DollarSign, TrendingUp, CreditCard, AlertTriangle,
  Plus, CheckCircle2, RefreshCw,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import KpiCard from '../components/KpiCard';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import InvoiceModal from '../components/InvoiceModal';
import PaymentModal from '../components/PaymentModal';
import useToast from '../hooks/useToast';
import {
  INITIAL_INVOICES,
  STATUS_META,
  totalOf,
  outstandingOf,
} from '../constants/billingData';
import './Billing.css';
import './BillingDashboard.css';

const PAYMENT_TREND = [
  { day: '04 Jun', amount: 4500 },
  { day: '05 Jun', amount: 7200 },
  { day: '06 Jun', amount: 2800 },
  { day: '07 Jun', amount: 5100 },
  { day: '08 Jun', amount: 3600 },
  { day: '09 Jun', amount: 6400 },
  { day: '10 Jun', amount: 8900 },
  { day: '11 Jun', amount: 4300 },
  { day: '12 Jun', amount: 5700 },
  { day: '13 Jun', amount: 9200 },
  { day: '14 Jun', amount: 3100 },
  { day: '15 Jun', amount: 6800 },
  { day: '16 Jun', amount: 4900 },
  { day: '17 Jun', amount: 7500 },
  { day: '18 Jun', amount: 5200 },
  { day: '19 Jun', amount: 8100 },
  { day: '20 Jun', amount: 6300 },
  { day: '21 Jun', amount: 4700 },
  { day: '22 Jun', amount: 5500 },
  { day: '23 Jun', amount: 9800 },
  { day: '24 Jun', amount: 3900 },
  { day: '25 Jun', amount: 7100 },
  { day: '26 Jun', amount: 5800 },
  { day: '27 Jun', amount: 6200 },
  { day: '28 Jun', amount: 4800 },
  { day: '29 Jun', amount: 8400 },
  { day: '30 Jun', amount: 6700 },
  { day: '01 Jul', amount: 2000 },
  { day: '02 Jul', amount: 5300 },
  { day: '03 Jul', amount: 4800 },
];

const MONTHLY_REVENUE = PAYMENT_TREND.reduce((s, d) => s + d.amount, 0);
const TODAY_COLLECTIONS = PAYMENT_TREND[PAYMENT_TREND.length - 1].amount;

const BillingDashboard = () => {
  const { role } = useAuth();
  const [invoices, setInvoices] = useState(INITIAL_INVOICES);
  const [modal, setModal] = useState(null);
  const [viewState, setViewState] = useState('loaded');
  const { toast, showToast } = useToast();
  const outstandingRef = useRef(null);

  const loading = viewState === 'loading';
  const isEmpty = viewState === 'empty';

  const displayInvoices = isEmpty ? [] : invoices;
  const trendData = isEmpty ? [] : PAYMENT_TREND;

  const todayCollections = isEmpty ? 0 : TODAY_COLLECTIONS;
  const monthlyRevenue = isEmpty ? 0 : MONTHLY_REVENUE;
  const outstandingTotal = displayInvoices.reduce((s, inv) => s + outstandingOf(inv), 0);
  const overdueCount = displayInvoices.filter(inv => inv.status === 'overdue').length;

  const outstandingInvoices = displayInvoices.filter(inv => inv.status !== 'paid');

  const handleCreateInvoice = (form) => {
    const id = `INV-${String(invoices.length + 1).padStart(3, '0')}`;
    setInvoices(prev => [...prev, { ...form, id }]);
    showToast('Invoice created successfully.');
    setModal(null);
  };

  const handleRecordPayment = (inv, amount) => {
    setInvoices(prev => prev.map(i => {
      if (i.id !== inv.id) return i;
      const newPaid = (i.paid || 0) + amount;
      return { ...i, paid: newPaid, status: newPaid >= totalOf(i) ? 'paid' : 'partial' };
    }));
    showToast(`Payment of Rs. ${amount.toLocaleString()} recorded.`);
    setModal(null);
  };

  const handleScrollToOutstanding = () => {
    if (outstandingInvoices.length === 0) {
      showToast('No outstanding invoices — all cleared.');
      return;
    }
    outstandingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="billing-dashboard">

      {/* ── Header toolbar ────────────────────────────── */}
      <div className="bd-topbar" role="toolbar" aria-label="Dashboard controls">
        <div>
          <h2>Financial Dashboard</h2>
          <p className="page-subtitle">
            Billing overview · 3 July 2026
          </p>
        </div>
        <div className="bd-topbar-controls">
          <label htmlFor="bd-state" className="sr-only">Choose view state</label>
          <select
            id="bd-state"
            className="state-dropdown"
            value={viewState}
            onChange={(e) => setViewState(e.target.value)}
          >
            <option value="loaded">State: Real Data</option>
            <option value="loading">State: Loading</option>
            <option value="empty">State: Empty</option>
          </select>
          <button
            className="refresh-btn"
            onClick={() => { setViewState('loading'); setTimeout(() => setViewState('loaded'), 900); }}
            aria-label="Refresh dashboard"
          >
            <RefreshCw size={15} aria-hidden="true" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ── Overdue alert ──────────────────────────────── */}
      {!loading && overdueCount > 0 && (
        <div className="alert-banner alert-banner--warning" role="alert">
          <AlertTriangle size={15} aria-hidden="true" />
          <strong>{overdueCount} overdue invoice{overdueCount !== 1 ? 's' : ''}</strong> — immediate follow-up required.
        </div>
      )}

      {/* ── KPI cards ──────────────────────────────────── */}
      <section className="bd-kpis" aria-label="Key financial metrics">
        <KpiCard
          title="Today's Collections"
          value={`Rs. ${todayCollections.toLocaleString()}`}
          icon={DollarSign}
          trend={{ value: 12, isPositive: true }}
          iconBgColor="rgba(34, 197, 94, 0.1)"
          iconColor="var(--color-secondary)"
          loading={loading}
        />
        <KpiCard
          title="Monthly Revenue"
          value={`Rs. ${monthlyRevenue.toLocaleString()}`}
          icon={TrendingUp}
          trend={{ value: 8, isPositive: true }}
          iconBgColor="rgba(37, 99, 235, 0.1)"
          iconColor="var(--color-primary)"
          loading={loading}
        />
        <KpiCard
          title="Outstanding Balance"
          value={`Rs. ${outstandingTotal.toLocaleString()}`}
          icon={CreditCard}
          trend={{ value: 5, isPositive: false }}
          iconBgColor="rgba(245, 158, 11, 0.1)"
          iconColor="var(--color-warning)"
          loading={loading}
        />
        <KpiCard
          title="Overdue Invoices"
          value={overdueCount}
          icon={AlertTriangle}
          trend={overdueCount > 0 ? { value: overdueCount, isPositive: false } : null}
          iconBgColor="rgba(239, 68, 68, 0.1)"
          iconColor="var(--color-danger)"
          loading={loading}
        />
      </section>

      {/* ── Chart + Quick Actions ──────────────────────── */}
      <div className="bd-mid-grid">

        {/* Payment trend chart */}
        <div className="bd-card">
          <div className="bd-card-header">
            <h3>Payment Collections</h3>
            <span className="bd-card-subtitle">Last 30 days</span>
          </div>
          <div className="bd-card-body">
            {loading ? (
              <div className="bd-chart-skeleton skeleton" aria-busy="true" aria-label="Loading chart" />
            ) : trendData.length === 0 ? (
              <EmptyState icon={TrendingUp} message="No payment data available for this period." />
            ) : (
              <div style={{ width: '100%', height: 220 }}>
                <ResponsiveContainer>
                  <AreaChart data={trendData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="bdCollectGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="var(--color-primary)" stopOpacity={0.18} />
                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis
                      dataKey="day"
                      tick={{ fill: '#64748B', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      interval={4}
                    />
                    <YAxis
                      tick={{ fill: '#64748B', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={v => `${v / 1000}k`}
                    />
                    <Tooltip
                      formatter={v => [`Rs. ${Number(v).toLocaleString()}`, 'Collections']}
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        fontFamily: 'Poppins',
                        fontSize: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="var(--color-primary)"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#bdCollectGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bd-card">
          <div className="bd-card-header">
            <h3>Quick Actions</h3>
          </div>
          <div className="bd-card-body">
            <div className="bd-actions-list">
              <button
                className="bd-action-btn"
                onClick={() => setModal({ type: 'invoice' })}
                aria-label="Open create invoice form"
              >
                <div className="bd-action-icon bd-action-icon--primary" aria-hidden="true">
                  <Plus size={20} />
                </div>
                <div className="bd-action-text">
                  <span className="bd-action-title">Create Invoice</span>
                  <span className="bd-action-desc">Generate a new patient invoice</span>
                </div>
              </button>

              <button
                className="bd-action-btn"
                onClick={handleScrollToOutstanding}
                aria-label="Scroll to outstanding invoices"
              >
                <div className="bd-action-icon bd-action-icon--success" aria-hidden="true">
                  <CheckCircle2 size={20} />
                </div>
                <div className="bd-action-text">
                  <span className="bd-action-title">Record Payment</span>
                  <span className="bd-action-desc">
                    {outstandingInvoices.length > 0
                      ? `${outstandingInvoices.length} invoice${outstandingInvoices.length !== 1 ? 's' : ''} awaiting payment`
                      : 'All invoices cleared'
                    }
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Outstanding invoices table ─────────────────── */}
      <section
        ref={outstandingRef}
        className="bd-card"
        aria-labelledby="outstanding-heading"
      >
        <div className="bd-card-header">
          <div>
            <h3 id="outstanding-heading">Outstanding Invoices</h3>
            {!loading && (
              <p className="page-subtitle">
                {outstandingInvoices.length === 0
                  ? 'All invoices are cleared'
                  : `${outstandingInvoices.length} invoice${outstandingInvoices.length !== 1 ? 's' : ''} pending payment`
                }
              </p>
            )}
          </div>
        </div>

        <div className="bd-table-body">
          {loading ? (
            <div className="bd-table-skeleton">
              <LoadingSkeleton variant="text" count={4} />
            </div>
          ) : outstandingInvoices.length === 0 ? (
            <div className="bd-empty-wrapper">
              <EmptyState icon={CreditCard} message="No outstanding invoices. All payments are up to date." />
            </div>
          ) : (
            <table className="data-table" aria-label="Outstanding invoices requiring payment">
              <thead>
                <tr>
                  <th scope="col">Invoice</th>
                  <th scope="col">Patient</th>
                  <th scope="col">Total</th>
                  <th scope="col">Outstanding</th>
                  <th scope="col">Due Date</th>
                  <th scope="col">Status</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {outstandingInvoices.map(inv => {
                  const owed = outstandingOf(inv);
                  const tot = totalOf(inv);
                  const meta = STATUS_META[inv.status] || STATUS_META.unpaid;
                  return (
                    <tr key={inv.id} className={inv.status === 'overdue' ? 'tr--overdue' : ''}>
                      <td><span className="inv-id">{inv.id}</span></td>
                      <td className="cell-bold">{inv.patient.split(' (')[0]}</td>
                      <td>Rs. {tot.toLocaleString()}</td>
                      <td className={owed > 0 ? 'amount-outstanding' : 'amount-cleared'}>
                        Rs. {owed.toLocaleString()}
                      </td>
                      <td className={inv.status === 'overdue' ? 'text-danger' : 'text-muted'}>
                        {inv.dueDate}
                      </td>
                      <td>
                        <span className={`badge ${meta.cls}`}>{meta.label}</span>
                      </td>
                      <td>
                        <button
                          className="icon-btn icon-btn--success"
                          title="Record payment for this invoice"
                          onClick={() => setModal({ type: 'payment', data: inv })}
                          aria-label={`Record payment for invoice ${inv.id}`}
                        >
                          <CheckCircle2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* ── Modals ─────────────────────────────────────── */}
      {modal?.type === 'invoice' && (
        <InvoiceModal
          onClose={() => setModal(null)}
          onSave={handleCreateInvoice}
        />
      )}
      {modal?.type === 'payment' && (
        <PaymentModal
          invoice={modal.data}
          onClose={() => setModal(null)}
          onRecord={(amt) => handleRecordPayment(modal.data, amt)}
        />
      )}

      {toast && <div className="toast toast--success" role="status">{toast}</div>}
    </div>
  );
};

export default BillingDashboard;
