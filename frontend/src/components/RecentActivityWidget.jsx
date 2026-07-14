import { Activity } from 'lucide-react';
import EmptyState from './EmptyState';
import LoadingSkeleton from './LoadingSkeleton';
import './RecentActivityWidget.css';

const RecentActivityWidget = ({ activities = [], loading }) => {
  if (loading) {
    return (
      <div className="dashboard-widget recent-activity-widget loading">
        <div className="widget-header">
          <LoadingSkeleton variant="title" width="150px" />
        </div>
        <div className="widget-content">
          <LoadingSkeleton variant="text" count={4} />
        </div>
      </div>
    );
  }

  // Helper for assigning module colors (to match implementation plan design system)
  const getModuleClass = (module) => {
    switch (module?.toLowerCase()) {
      case 'patients':
        return 'activity-dot--patients';
      case 'billing':
        return 'activity-dot--billing';
      case 'inventory':
        return 'activity-dot--inventory';
      case 'appointments':
        return 'activity-dot--appointments';
      case 'staff':
        return 'activity-dot--staff';
      default:
        return 'activity-dot--default';
    }
  };

  return (
    <div className="dashboard-widget recent-activity-widget">
      <div className="widget-header">
        <div className="widget-title-area">
          <Activity size={20} className="widget-header-icon" aria-hidden="true" />
          <h2>Recent Activity & Audit Log</h2>
        </div>
      </div>

      <div className="widget-body">
        {activities.length === 0 ? (
          <EmptyState icon={Activity} message="No recent activity logged." />
        ) : (
          <div className="activity-timeline-container">
            <ul className="activity-timeline" aria-label="Activity timeline log">
              {activities.map((act) => (
                <li key={act.id} className="activity-timeline-item">
                  <div className="activity-timeline-marker">
                    <span
                      className={`activity-dot ${getModuleClass(act.module)}`}
                      aria-hidden="true"
                    />
                    <div className="activity-line" aria-hidden="true" />
                  </div>
                  
                  <div className="activity-item-content">
                    <div className="activity-item-header">
                      <span className="activity-item-user">{act.user}</span>
                      <span className="activity-item-time">{act.timestamp}</span>
                    </div>
                    <p className="activity-item-description">{act.action}</p>
                    <span className={`activity-module-tag ${getModuleClass(act.module)}-tag`}>
                      {act.module}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivityWidget;
