import './StatusBadge.css';

const STATUS_CONFIG = {
  confirmed: { label: 'Confirmed', className: 'status-badge--success' },
  active: { label: 'Active', className: 'status-badge--success' },
  pending: { label: 'Pending', className: 'status-badge--warning' },
  cancelled: { label: 'Cancelled', className: 'status-badge--danger' },
  overdue: { label: 'Overdue', className: 'status-badge--danger' },
  inactive: { label: 'Inactive', className: 'status-badge--muted' },
};

const StatusBadge = ({ status, customLabel }) => {
  const config = STATUS_CONFIG[status] || {
    label: status,
    className: 'status-badge--muted',
  };

  return (
    <span className={`status-badge ${config.className}`}>
      {customLabel || config.label}
    </span>
  );
};

export default StatusBadge;
