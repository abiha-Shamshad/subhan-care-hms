import { Bell, LogOut, Menu } from 'lucide-react';
import { useAuth, ROLE_LABELS } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import './Topbar.css';

const getInitials = (name) =>
  name
    .replace(/^Dr\.?\s+/i, '')
    .replace(/^Mr\.?\s+/i, '')
    .replace(/^Ms\.?\s+/i, '')
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const Topbar = ({ onMenuToggle, activeTitle = 'Dashboard' }) => {
  const { role, user, logout } = useAuth();
  const { navigate } = useNavigation();

  const handleLogout = () => {
    navigate('dashboard');
    logout();
  };

  const initials = user?.name ? getInitials(user.name) : '--';
  const displayName = user?.name ?? ROLE_LABELS[role] ?? 'User';
  const displayRole = ROLE_LABELS[role] ?? '';

  return (
    <header className="topbar" aria-label="Top Bar">
      <div className="topbar-left">
        <button
          className="topbar-menu-btn"
          onClick={onMenuToggle}
          aria-label="Toggle Navigation Sidebar"
        >
          <Menu size={24} />
        </button>
        <h1 className="topbar-title">{activeTitle}</h1>
      </div>

      <div className="topbar-right">
        <div className="topbar-search" role="search">
          <svg
            className="topbar-search-icon"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="search"
            placeholder="Search patients, doctors..."
            aria-label="Search dashboard"
          />
        </div>

        <button className="topbar-notification-btn" aria-label="Notifications, 3 unread">
          <Bell size={20} aria-hidden="true" />
          <span className="topbar-notification-badge" aria-hidden="true">3</span>
        </button>

        <div className="topbar-user">
          <div className="topbar-avatar" aria-hidden="true">
            {initials}
          </div>
          <div className="topbar-user-info">
            <span className="topbar-username">{displayName}</span>
            <span className="topbar-role">{displayRole}</span>
          </div>
        </div>

        <button
          className="topbar-logout-btn"
          onClick={handleLogout}
          aria-label="Log out of Subhan Care"
        >
          <LogOut size={18} aria-hidden="true" />
          <span className="topbar-logout-text">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Topbar;
