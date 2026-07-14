import { CreditCard, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import EmptyState from './EmptyState';
import LoadingSkeleton from './LoadingSkeleton';
import './BillingWidget.css';

const BillingWidget = ({ monthlyRevenue = [], outstandingInvoices = 0, totalRevenue = 0, loading }) => {
  if (loading) {
    return (
      <div className="dashboard-widget billing-widget loading">
        <div className="widget-header">
          <LoadingSkeleton variant="title" width="150px" />
        </div>
        <div className="widget-content">
          <LoadingSkeleton variant="text" count={4} />
        </div>
      </div>
    );
  }

  // Format currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  const hasOutstandingAlert = outstandingInvoices > 15;

  return (
    <div className="dashboard-widget billing-widget">
      <div className="widget-header">
        <div className="widget-title-area">
          <CreditCard size={20} className="widget-header-icon" aria-hidden="true" />
          <h2>Billing & Payments</h2>
        </div>
      </div>

      <div className="widget-body">
        <div className="billing-summary-grid">
          <div className="billing-stat-card">
            <span className="billing-stat-label">Revenue (This Month)</span>
            <span className="billing-stat-value text-success">{formatCurrency(totalRevenue)}</span>
          </div>

          <div className={`billing-stat-card ${hasOutstandingAlert ? 'alert-critical' : ''}`}>
            <span className="billing-stat-label">Outstanding Invoices</span>
            <div className="billing-stat-value-container">
              <span className="billing-stat-value">{outstandingInvoices}</span>
              {hasOutstandingAlert && (
                <AlertTriangle size={18} className="outstanding-alert-icon" aria-hidden="true" />
              )}
            </div>
          </div>
        </div>

        {hasOutstandingAlert && (
          <div className="billing-alert-banner" role="alert">
            <strong>Action Required:</strong> High volume of outstanding bills. Send invoice reminders.
          </div>
        )}

        <hr className="widget-divider" aria-hidden="true" />

        <div className="billing-trend">
          <h3>Revenue Trend</h3>
          {monthlyRevenue.length === 0 ? (
            <EmptyState icon={CreditCard} message="No billing data available." />
          ) : (
            <div className="chart-container" style={{ width: '100%', height: 180 }}>
              <ResponsiveContainer>
                <AreaChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(tick) => `$${tick / 1000}k`}
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(value), 'Revenue']}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      fontFamily: 'Poppins',
                      fontSize: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillingWidget;
