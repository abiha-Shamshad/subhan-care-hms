import './EmptyState.css';

const EmptyState = ({ icon: Icon, message, actionLabel, onAction }) => {
  return (
    <div className="empty-state">
      {Icon && <Icon className="empty-state__icon" size={48} />}
      <p className="empty-state__message">{message}</p>
      {actionLabel && onAction && (
        <button className="empty-state__button" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
