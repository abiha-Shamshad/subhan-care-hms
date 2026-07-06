import LoadingSkeleton from './LoadingSkeleton';
import './KpiCard.css';

const KpiCard = ({ title, value, icon: Icon, trend, iconBgColor = 'var(--color-primary-light)', iconColor = 'var(--color-primary)', loading }) => {
  if (loading) {
    return (
      <div className="kpi-card loading">
        <div className="kpi-card-icon-container">
          <LoadingSkeleton variant="circle" width="48px" height="48px" />
        </div>
        <div className="kpi-card-content">
          <LoadingSkeleton variant="text" width="60px" />
          <LoadingSkeleton variant="text" width="90px" />
        </div>
      </div>
    );
  }

  const isTrendPositive = trend?.isPositive;

  return (
    <div className="kpi-card" tabIndex="0">
      <div
        className="kpi-card-icon-container"
        style={{ backgroundColor: iconBgColor, color: iconColor }}
        aria-hidden="true"
      >
        <Icon size={24} />
      </div>
      <div className="kpi-card-content">
        <span className="kpi-card-title">{title}</span>
        <div className="kpi-card-value-row">
          <span className="kpi-card-value">{value}</span>
          {trend && trend.value !== 0 && (
            <span
              className={`kpi-card-trend ${
                isTrendPositive ? 'trend--positive' : 'trend--negative'
              }`}
              aria-label={`${trend.value}% ${isTrendPositive ? 'increase' : 'decrease'}`}
            >
              {isTrendPositive ? '↑' : '↓'} {trend.value}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default KpiCard;
