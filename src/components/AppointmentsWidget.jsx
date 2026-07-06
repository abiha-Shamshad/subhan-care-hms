import { CalendarDays } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import StatusBadge from './StatusBadge';
import EmptyState from './EmptyState';
import LoadingSkeleton from './LoadingSkeleton';
import './AppointmentsWidget.css';

const AppointmentsWidget = ({ appointments = [], weeklyData = [], loading }) => {
  if (loading) {
    return (
      <div className="dashboard-widget appointments-widget loading">
        <div className="widget-header">
          <LoadingSkeleton variant="title" width="150px" />
        </div>
        <div className="widget-content">
          <LoadingSkeleton variant="text" count={4} />
        </div>
      </div>
    );
  }

  const activeAppointments = appointments.filter(apt => apt.status !== 'cancelled');

  return (
    <div className="dashboard-widget appointments-widget">
      <div className="widget-header">
        <div className="widget-title-area">
          <CalendarDays size={20} className="widget-header-icon" aria-hidden="true" />
          <h2>Today's Appointments</h2>
        </div>
        <span className="widget-badge" aria-label={`${activeAppointments.length} appointments scheduled today`}>
          {activeAppointments.length} Active
        </span>
      </div>

      <div className="widget-body">
        {appointments.length === 0 ? (
          <EmptyState icon={CalendarDays} message="No appointments scheduled today." />
        ) : (
          <div className="appointments-list-container">
            <ul className="appointments-list">
              {appointments.map((apt) => (
                <li key={apt.id} className="appointment-item">
                  <div className="apt-time">{apt.time}</div>
                  <div className="apt-details">
                    <span className="apt-patient-name">{apt.patientName}</span>
                    <span className="apt-doctor-name">{apt.doctorName}</span>
                  </div>
                  <div className="apt-status">
                    <StatusBadge status={apt.status} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <hr className="widget-divider" aria-hidden="true" />

        <div className="appointments-trend">
          <h3>Weekly Trend</h3>
          <div className="chart-container" style={{ width: '100%', height: 180 }}>
            <ResponsiveContainer>
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="day" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    fontFamily: 'Poppins',
                    fontSize: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
                  }}
                  cursor={{ fill: 'rgba(37, 99, 235, 0.04)' }}
                />
                <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentsWidget;
