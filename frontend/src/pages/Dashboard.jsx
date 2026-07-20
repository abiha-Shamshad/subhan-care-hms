import { useState, useEffect } from 'react';
import { Users, CalendarDays, Stethoscope, CreditCard, RefreshCw } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import KpiCard from '../components/KpiCard';
import QuickActions from '../components/QuickActions';
import AppointmentsWidget from '../components/AppointmentsWidget';
import BillingWidget from '../components/BillingWidget';
import InventoryWidget from '../components/InventoryWidget';
import StaffStatusWidget from '../components/StaffStatusWidget';
import RecentActivityWidget from '../components/RecentActivityWidget';

// Import data from constants
import {
  KPI_DATA,
  TODAY_APPOINTMENTS,
  WEEKLY_APPOINTMENTS,
  MONTHLY_REVENUE,
  BILLING_STATS,
  LOW_STOCK_ITEMS,
  STAFF_DATA,
  RECENT_ACTIVITIES,
} from '../constants/dashboardData';

import './Dashboard.css';

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [viewState, setViewState] = useState('loaded'); // 'loaded', 'loading', 'empty'
  const { navigate } = useNavigation();

  const handleRegisterPatient = () => navigate('patients', { openRegister: true });
  const handleAddAppointment = () => navigate('appointments', { openBook: true });
  const handleGenerateReport = () => navigate('reports');

  // Toggle layout simulator (simulates NFR-05 quick refresh / loaders)
  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  // Synchronize loading status when state selector changes
  useEffect(() => {
    if (viewState === 'loading') {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [viewState]);

  // Determine current dataset based on viewState
  const currentAppointments = viewState === 'empty' ? [] : TODAY_APPOINTMENTS;
  const currentWeeklyData = viewState === 'empty' ? [] : WEEKLY_APPOINTMENTS;
  const currentRevenue = viewState === 'empty' ? [] : MONTHLY_REVENUE;
  const currentBillingStats = viewState === 'empty' ? { totalRevenue: 0, outstandingInvoices: 0 } : BILLING_STATS;
  const currentInventory = viewState === 'empty' ? [] : LOW_STOCK_ITEMS;
  const currentStaff = viewState === 'empty' ? { onDuty: 0, offDuty: 0, staffList: [] } : STAFF_DATA;
  const currentActivities = viewState === 'empty' ? [] : RECENT_ACTIVITIES;
  const currentKpiData = viewState === 'empty' ? {
    totalPatients: { value: 0, trend: { value: 0, isPositive: true } },
    todayAppointments: { value: 0, trend: { value: 0, isPositive: true } },
    activeDoctors: { value: 0, trend: { value: 0, isPositive: true } },
    pendingBills: { value: 0, trend: { value: 0, isPositive: true } },
  } : KPI_DATA;

  return (
    <div className="dashboard-page">
      {/* Simulation Controls — Premium Touch to let user test all required states */}
      <div className="dashboard-controls" role="toolbar" aria-label="Dashboard state simulator">
        <div className="controls-left">
          <h2>Overview Dashboard</h2>
          <p className="subtitle">Real-time health status of Subhan Care Hospital</p>
        </div>
        <div className="controls-right">
          <label htmlFor="state-select" className="sr-only">Choose dashboard state</label>
          <select
            id="state-select"
            value={viewState}
            onChange={(e) => setViewState(e.target.value)}
            className="state-dropdown"
          >
            <option value="loaded">State: Real Data</option>
            <option value="loading">State: Skeleton Loaders</option>
            <option value="empty">State: Empty Widgets</option>
          </select>

          <button
            className="refresh-btn"
            onClick={handleRefresh}
            aria-label="Refresh dashboard data"
          >
            <RefreshCw size={16} className={loading && viewState !== 'loading' ? 'spinning' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Section */}
      <section className="kpis-section" aria-label="Key Performance Indicators">
        <KpiCard
          title="Total Patients"
          value={currentKpiData.totalPatients.value}
          icon={Users}
          trend={currentKpiData.totalPatients.trend}
          iconBgColor="rgba(37, 99, 235, 0.08)"
          iconColor="var(--color-primary)"
          loading={loading}
        />
        <KpiCard
          title="Today's Appointments"
          value={currentKpiData.todayAppointments.value}
          icon={CalendarDays}
          trend={currentKpiData.todayAppointments.trend}
          iconBgColor="rgba(168, 85, 247, 0.08)"
          iconColor="#a855f7"
          loading={loading}
        />
        <KpiCard
          title="Active Doctors"
          value={currentKpiData.activeDoctors.value}
          icon={Stethoscope}
          trend={currentKpiData.activeDoctors.trend}
          iconBgColor="rgba(34, 197, 94, 0.08)"
          iconColor="var(--color-secondary)"
          loading={loading}
        />
        <KpiCard
          title="Pending Invoices"
          value={currentKpiData.pendingBills.value}
          icon={CreditCard}
          trend={currentKpiData.pendingBills.trend}
          iconBgColor="rgba(245, 158, 11, 0.08)"
          iconColor="var(--color-warning)"
          loading={loading}
        />
      </section>

      {/* Main Grid Widgets Layout */}
      <div className="dashboard-grid-layout">
        {/* Left Column */}
        <div className="dashboard-column gap-lg">
          <AppointmentsWidget
            appointments={currentAppointments}
            weeklyData={currentWeeklyData}
            loading={loading}
          />
          
          <BillingWidget
            monthlyRevenue={currentRevenue}
            outstandingInvoices={currentBillingStats.outstandingInvoices}
            totalRevenue={currentBillingStats.totalRevenue}
            loading={loading}
          />
        </div>

        {/* Right Column */}
        <div className="dashboard-column gap-lg">
          <QuickActions
            onRegisterPatient={handleRegisterPatient}
            onAddAppointment={handleAddAppointment}
            onGenerateReport={handleGenerateReport}
          />

          <div className="dashboard-split-row">
            <InventoryWidget
              items={currentInventory}
              loading={loading}
            />
            <StaffStatusWidget
              onDuty={currentStaff.onDuty}
              offDuty={currentStaff.offDuty}
              staffList={currentStaff.staffList}
              loading={loading}
            />
          </div>

          <RecentActivityWidget
            activities={currentActivities}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
