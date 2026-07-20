import { useState, useRef, useEffect } from 'react';
import { Bell, Package, CreditCard, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { inventoryService, invoiceService } from '../services/api';
import EmptyState from './EmptyState';
import LoadingSkeleton from './LoadingSkeleton';
import './NotificationsMenu.css';

const NotificationsMenu = () => {
  const { access } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const wrapRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const load = async () => {
    setLoading(true);
    const items = [];
    try {
      if (access('inventory')) {
        const inventory = await inventoryService.getAll();
        inventory
          .filter((i) => i.status !== 'in-stock')
          .forEach((i) => items.push({
            id: `inv-${i._id}`,
            icon: Package,
            title: i.status === 'out-of-stock' ? `${i.name} is out of stock` : `${i.name} is low on stock`,
            subtitle: `${i.quantity} ${i.unit} remaining · reorder at ${i.reorderLevel}`,
            severity: i.status === 'out-of-stock' ? 'danger' : 'warning',
          }));
      }
      if (access('billing')) {
        const invoices = await invoiceService.getAll();
        invoices
          .filter((inv) => inv.status === 'overdue')
          .forEach((inv) => items.push({
            id: `bill-${inv._id}`,
            icon: CreditCard,
            title: `Invoice ${inv.invoiceId} is overdue`,
            subtitle: `${inv.patient} · due ${new Date(inv.dueDate).toLocaleDateString()}`,
            severity: 'danger',
          }));
      }
    } catch {
      // best-effort — surface whatever was gathered before the failure
    }
    setNotifications(items);
    setLoading(false);
    setLoaded(true);
  };

  const toggle = () => {
    setOpen((wasOpen) => {
      const next = !wasOpen;
      if (next && !loaded) load();
      return next;
    });
  };

  return (
    <div className="topbar-notification-wrap" ref={wrapRef}>
      <button
        className="topbar-notification-btn"
        onClick={toggle}
        aria-label={`Notifications${notifications.length ? `, ${notifications.length} unread` : ''}`}
        aria-expanded={open}
      >
        <Bell size={20} aria-hidden="true" />
        {notifications.length > 0 && (
          <span className="topbar-notification-badge" aria-hidden="true">{notifications.length}</span>
        )}
      </button>

      {open && (
        <div className="notif-panel" role="menu">
          <div className="notif-panel-header">Notifications</div>
          <div className="notif-panel-body">
            {loading ? (
              <LoadingSkeleton variant="text" count={3} />
            ) : notifications.length === 0 ? (
              <EmptyState icon={CheckCircle2} message="You're all caught up." />
            ) : (
              <ul className="notif-list">
                {notifications.map((n) => {
                  const Icon = n.icon;
                  return (
                    <li key={n.id} className={`notif-item notif-item--${n.severity}`}>
                      <Icon size={16} className="notif-item-icon" aria-hidden="true" />
                      <div>
                        <div className="notif-item-title">{n.title}</div>
                        <div className="notif-item-subtitle">{n.subtitle}</div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsMenu;
