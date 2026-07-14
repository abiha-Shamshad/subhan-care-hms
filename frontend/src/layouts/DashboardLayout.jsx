import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import './DashboardLayout.css';

const DashboardLayout = ({ children, activePage = 'dashboard', activeTitle = 'Dashboard', onNavigate }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleSidebar = () => {
    if (window.innerWidth <= 768) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  // Automatically handle resize transitions
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsSidebarCollapsed(false);
      } else {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // run on mount

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="dashboard-layout">
      {/* Sidebar component */}
      <Sidebar
        activePage={activePage}
        isCollapsed={isSidebarCollapsed}
        onToggle={toggleSidebar}
        onNavigate={onNavigate}
      />

      {/* Mobile Drawer Sidebar Overlay */}
      {isMobileOpen && (
        <div
          className="sidebar-mobile-overlay"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile navigation wrapper (cloned styles) */}
      <div className={`sidebar-mobile-wrapper ${isMobileOpen ? 'open' : ''}`}>
        <Sidebar activePage={activePage} isCollapsed={false} onToggle={toggleSidebar} onNavigate={onNavigate} />
      </div>

      <div
        className={`dashboard-main ${
          isSidebarCollapsed ? 'sidebar-collapsed' : ''
        }`}
      >
        <Topbar onMenuToggle={toggleSidebar} activeTitle={activeTitle} />
        
        <main className="dashboard-content" id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
