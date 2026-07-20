import { LogOut, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import ThemeToggle from './ThemeToggle';
import NotificationsMenu from './NotificationsMenu';
import UserProfileCard from './UserProfileCard';
import './Topbar.css';

const Topbar = ({ onMenuToggle, activeTitle = 'Dashboard' }) => {
  const { logout } = useAuth();
  const { navigate } = useNavigation();

  const handleLogout = () => {
    navigate('dashboard');
    logout();
  };

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

        <ThemeToggle />

        <NotificationsMenu />

        <UserProfileCard />

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
