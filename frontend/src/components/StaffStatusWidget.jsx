import { UserCog } from 'lucide-react';
import LoadingSkeleton from './LoadingSkeleton';
import './StaffStatusWidget.css';

const StaffStatusWidget = ({ onDuty = 0, offDuty = 0, staffList = [], loading }) => {
  if (loading) {
    return (
      <div className="dashboard-widget staff-status-widget loading">
        <div className="widget-header">
          <LoadingSkeleton variant="title" width="150px" />
        </div>
        <div className="widget-content">
          <LoadingSkeleton variant="text" count={4} />
        </div>
      </div>
    );
  }

  const totalStaff = onDuty + offDuty;
  const onDutyPercentage = totalStaff > 0 ? (onDuty / totalStaff) * 100 : 0;

  return (
    <div className="dashboard-widget staff-status-widget">
      <div className="widget-header">
        <div className="widget-title-area">
          <UserCog size={20} className="widget-header-icon" aria-hidden="true" />
          <h2>Staff Status</h2>
        </div>
      </div>

      <div className="widget-body">
        <div className="staff-stats-summary">
          <div className="staff-stat-box on-duty">
            <span className="staff-stat-count">{onDuty}</span>
            <span className="staff-stat-label">On Duty</span>
          </div>
          <div className="staff-stat-box off-duty">
            <span className="staff-stat-count">{offDuty}</span>
            <span className="staff-stat-label">Off Duty</span>
          </div>
        </div>

        <div className="staff-duty-progress-area">
          <div className="staff-progress-label-row">
            <span>On-Duty Ratio</span>
            <strong>{Math.round(onDutyPercentage)}%</strong>
          </div>
          <div className="staff-progress-track">
            <div
              className="staff-progress-bar"
              style={{ width: `${onDutyPercentage}%` }}
              role="progressbar"
              aria-valuenow={onDuty}
              aria-valuemin="0"
              aria-valuemax={totalStaff}
              aria-label="Staff On-Duty Percentage"
            />
          </div>
        </div>

        <div className="staff-list-container">
          <ul className="staff-list">
            {staffList.map((staff, idx) => (
              <li key={idx} className="staff-list-item">
                <div className="staff-list-left">
                  <span
                    className={`staff-status-dot ${
                      staff.isOnDuty ? 'active' : 'inactive'
                    }`}
                    aria-hidden="true"
                  />
                  <div className="staff-info">
                    <span className="staff-name">{staff.name}</span>
                    <span className="staff-role">{staff.role}</span>
                  </div>
                </div>
                <span className="staff-status-text">
                  {staff.isOnDuty ? 'Available' : 'Offline'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StaffStatusWidget;
