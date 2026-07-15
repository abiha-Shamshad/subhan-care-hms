import { useState } from 'react';
import { BarChart3, TrendingUp, Package, ClipboardList, CalendarDays } from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import useApiResource from '../hooks/useApiResource';
import { reportsService } from '../services/api';
import './Reports.css';

const COLORS = ['#2563EB', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

const defaultFrom = () => {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().split('T')[0];
};
const defaultTo = () => new Date().toISOString().split('T')[0];

const ChartCard = ({ icon: Icon, title, subtitle, loading, isEmpty, emptyMessage, children }) => (
  <div className="rp-card">
    <h3>{title}</h3>
    {subtitle && <p className="rp-card-subtitle">{subtitle}</p>}
    {loading ? (
      <div className="rp-chart-skeleton skeleton" aria-busy="true" aria-label="Loading chart" />
    ) : isEmpty ? (
      <EmptyState icon={Icon} message={emptyMessage} />
    ) : (
      <div style={{ width: '100%', height: 260 }}>
        <ResponsiveContainer>{children}</ResponsiveContainer>
      </div>
    )}
  </div>
);

const Reports = () => {
  const [from, setFrom] = useState(defaultFrom());
  const [to, setTo] = useState(defaultTo());

  const { data: revenue, loading: l1 } = useApiResource(() => reportsService.revenue({ from, to }), [from, to]);
  const { data: inventoryUsage, loading: l2 } = useApiResource(() => reportsService.inventoryUsage(), []);
  const { data: rxTrends, loading: l3 } = useApiResource(() => reportsService.prescriptionTrends({ from, to }), [from, to]);
  const { data: apptLoad, loading: l4 } = useApiResource(() => reportsService.appointmentLoad({ from, to }), [from, to]);

  const revenueSeries = revenue?.series || [];
  const byCategory = inventoryUsage?.byCategory || [];
  const lowStock = inventoryUsage?.lowStock || [];
  const rxSeries = rxTrends?.series || [];
  const topMeds = rxTrends?.topMedications || [];
  const apptByDate = apptLoad?.byDate || [];
  const apptByStatus = apptLoad?.byStatus || [];

  return (
    <div className="rp-page">
      <div className="page-header">
        <div>
          <h2>Reports & Analytics</h2>
          <p className="page-subtitle">Hospital-wide performance over the selected period</p>
        </div>
      </div>

      <div className="rp-filters">
        <CalendarDays size={16} className="text-muted" />
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} aria-label="From date" />
        <span className="text-muted">to</span>
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} aria-label="To date" />
      </div>

      <div className="rp-grid">
        <ChartCard
          icon={TrendingUp}
          title="Revenue Over Time"
          subtitle="Billed vs. collected"
          loading={l1}
          isEmpty={revenueSeries.length === 0}
          emptyMessage="No invoices in this period."
        >
          <AreaChart data={revenueSeries} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="period" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v / 1000}k`} />
            <Tooltip formatter={(v) => `Rs. ${Number(v).toLocaleString()}`} />
            <Legend />
            <Area type="monotone" dataKey="billed" name="Billed" stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.15} />
            <Area type="monotone" dataKey="collected" name="Collected" stroke={COLORS[1]} fill={COLORS[1]} fillOpacity={0.2} />
          </AreaChart>
        </ChartCard>

        <ChartCard
          icon={Package}
          title="Inventory by Category"
          subtitle={`Current stock snapshot · ${lowStock.length} item${lowStock.length !== 1 ? 's' : ''} low/out of stock`}
          loading={l2}
          isEmpty={byCategory.length === 0}
          emptyMessage="No inventory items recorded."
        >
          <BarChart data={byCategory} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="category" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={60} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="quantity" name="Quantity" fill={COLORS[0]} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>

        <ChartCard
          icon={ClipboardList}
          title="Prescription Trends"
          subtitle="Issued vs. dispensed"
          loading={l3}
          isEmpty={rxSeries.length === 0}
          emptyMessage="No prescriptions in this period."
        >
          <LineChart data={rxSeries} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="issued" name="Issued" stroke={COLORS[0]} strokeWidth={2} />
            <Line type="monotone" dataKey="dispensed" name="Dispensed" stroke={COLORS[1]} strokeWidth={2} />
          </LineChart>
        </ChartCard>

        <ChartCard
          icon={CalendarDays}
          title="Appointment Load"
          subtitle="By status"
          loading={l4}
          isEmpty={apptByStatus.length === 0}
          emptyMessage="No appointments in this period."
        >
          <PieChart>
            <Pie data={apptByStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={90} label>
              {apptByStatus.map((entry, i) => <Cell key={entry.status} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ChartCard>
      </div>

      <div className="rp-grid">
        <ChartCard
          icon={CalendarDays}
          title="Appointments Booked per Day"
          loading={l4}
          isEmpty={apptByDate.length === 0}
          emptyMessage="No appointments in this period."
        >
          <BarChart data={apptByDate} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" name="Appointments" fill={COLORS[2]} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartCard>

        <div className="rp-card">
          <h3>Top Prescribed Medications</h3>
          <p className="rp-card-subtitle">In the selected period</p>
          {l3 ? (
            <LoadingSkeleton variant="text" count={4} />
          ) : topMeds.length === 0 ? (
            <EmptyState icon={BarChart3} message="No medication data available." />
          ) : (
            <div className="rp-med-list">
              {topMeds.map((m) => (
                <div key={m.name} className="rp-med-row">
                  <span>{m.name}</span>
                  <span className="text-secondary">{m.count} Rx</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
