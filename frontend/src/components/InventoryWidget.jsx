import { Package, AlertCircle, CheckCircle } from 'lucide-react';
import EmptyState from './EmptyState';
import LoadingSkeleton from './LoadingSkeleton';
import './InventoryWidget.css';

const InventoryWidget = ({ items = [], loading }) => {
  if (loading) {
    return (
      <div className="dashboard-widget inventory-widget loading">
        <div className="widget-header">
          <LoadingSkeleton variant="title" width="150px" />
        </div>
        <div className="widget-content">
          <LoadingSkeleton variant="text" count={4} />
        </div>
      </div>
    );
  }

  // Filter low-stock items
  const lowStockItems = items.filter(item => item.currentStock <= item.threshold);

  return (
    <div className="dashboard-widget inventory-widget">
      <div className="widget-header">
        <div className="widget-title-area">
          <Package size={20} className="widget-header-icon" aria-hidden="true" />
          <h2>Inventory Alerts</h2>
        </div>
        {lowStockItems.length > 0 ? (
          <span className="widget-badge widget-badge--danger" aria-label={`${lowStockItems.length} items low in stock`}>
            {lowStockItems.length} Alerts
          </span>
        ) : (
          <span className="widget-badge widget-badge--success">
            All Good
          </span>
        )}
      </div>

      <div className="widget-body">
        {items.length === 0 || lowStockItems.length === 0 ? (
          <div className="inventory-empty-state">
            <CheckCircle className="check-success-icon" size={40} aria-hidden="true" />
            <p>All medicines and supplies are well-stocked.</p>
          </div>
        ) : (
          <div className="inventory-list-container">
            <ul className="inventory-list">
              {lowStockItems.map((item) => {
                // Determine severity
                const ratio = item.currentStock / item.threshold;
                const isCritical = ratio <= 0.25;

                return (
                  <li
                    key={item.id}
                    className={`inventory-item ${isCritical ? 'critical' : 'warning'}`}
                  >
                    <div className="inventory-item-details">
                      <span className="inventory-item-name">{item.name}</span>
                      <span className="inventory-item-meta">
                        Stock: {item.currentStock} {item.unit} / Min: {item.threshold} {item.unit}
                      </span>
                    </div>

                    <div className="inventory-status-indicator">
                      <AlertCircle size={16} aria-hidden="true" />
                      <span>{isCritical ? 'Critical' : 'Low Stock'}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryWidget;
