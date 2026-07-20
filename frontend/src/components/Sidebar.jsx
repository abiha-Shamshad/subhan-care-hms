import { useState } from 'react';
import { NAVIGATION_ITEMS } from '../constants/navigation';
import { useAuth } from '../context/AuthContext';
import { HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import HelpSupportModal from './HelpSupportModal';
import './Sidebar.css';

const Sidebar = ({ activePage = 'dashboard', isCollapsed, onToggle, onNavigate }) => {
  const { canView, role } = useAuth();
  const visibleItems = NAVIGATION_ITEMS.filter((item) => canView(item.id));
  const [showHelp, setShowHelp] = useState(false);

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`} aria-label="Main Navigation">
      <div className="sidebar-brand">
        <div className="sidebar-logo">SC</div>
        {!isCollapsed && (
          <div className="sidebar-brand-text">
            <h2>Subhan Care</h2>
            <span>Hospital Management</span>
          </div>
        )}
      </div>

      <nav className="sidebar-nav" aria-label="Sidebar Navigation">
        <ul>
          {visibleItems.map((item) => {
            const Icon = item.roleIcons?.[role] ?? item.icon;
            const label = item.roleLabels?.[role] ?? item.label;
            const isActive = activePage === item.id;
            return (
              <li key={item.id}>
                <a
                  href="#"
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                  title={isCollapsed ? label : undefined}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    if (onNavigate) onNavigate(item.id);
                  }}
                >
                  <Icon size={20} aria-hidden="true" />
                  {!isCollapsed && <span className="sidebar-link-text">{label}</span>}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <a
          href="#"
          className="sidebar-link sidebar-link--footer"
          title={isCollapsed ? 'Help & Support' : undefined}
          onClick={(e) => { e.preventDefault(); setShowHelp(true); }}
        >
          <HelpCircle size={20} aria-hidden="true" />
          {!isCollapsed && <span className="sidebar-link-text">Help & Support</span>}
        </a>

        <button
          className="sidebar-toggle-btn"
          onClick={onToggle}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {showHelp && <HelpSupportModal onClose={() => setShowHelp(false)} />}
    </aside>
  );
};

export default Sidebar;
