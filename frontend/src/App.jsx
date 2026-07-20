import { AuthProvider, useAuth } from './context/AuthContext';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { ThemeProvider } from './context/ThemeContext';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import BillingDashboard from './pages/BillingDashboard';
import DoctorHome from './pages/DoctorHome';
import ReceptionistHome from './pages/ReceptionistHome';
import PharmacistHome from './pages/PharmacistHome';
import AuthScreen from './pages/AuthScreen';
import Patients from './pages/Patients';
import Doctors from './pages/Doctors';
import Staff from './pages/Staff';
import Appointments from './pages/Appointments';
import Prescriptions from './pages/Prescriptions';
import MedicalHistory from './pages/MedicalHistory';
import Billing from './pages/Billing';
import Inventory from './pages/Inventory';
import AuditLogs from './pages/AuditLogs';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import EmptyState from './components/EmptyState';
import ErrorBoundary from './components/ErrorBoundary';
import { BarChart3, Lock } from 'lucide-react';

const PAGE_TITLES = {
  dashboard:        'Administrative Overview',
  patients:         'Patient Management',
  doctors:          'Doctor Management',
  staff:            'Staff Management',
  appointments:     'Appointment Scheduling',
  prescriptions:    'Prescription Management',
  'medical-history':'Medical History',
  billing:          'Billing & Payments',
  inventory:        'Inventory Management',
  reports:          'Reports & Analytics',
  'audit-logs':     'Audit Logs',
  settings:         'Settings',
};

const PAGE_COMPONENTS = {
  dashboard:        Dashboard,
  patients:         Patients,
  doctors:          Doctors,
  staff:            Staff,
  appointments:     Appointments,
  prescriptions:    Prescriptions,
  'medical-history':MedicalHistory,
  billing:          Billing,
  inventory:        Inventory,
  'audit-logs':     AuditLogs,
  reports:          Reports,
  settings:         Settings,
};

const ROLE_DASHBOARD = {
  billing:      BillingDashboard,
  doctor:       DoctorHome,
  receptionist: ReceptionistHome,
  pharmacist:   PharmacistHome,
};

const ROLE_DASHBOARD_TITLE = {
  billing:      'Financial Dashboard',
  doctor:       "Today's Schedule",
  receptionist: "Today's Queue",
  pharmacist:   'Dispensing Queue',
};

function AppContent() {
  const { currentPage, navigate } = useNavigation();
  const { role, canView } = useAuth();

  const isDashboard = currentPage === 'dashboard';
  const PageComponent = isDashboard
    ? (ROLE_DASHBOARD[role] ?? Dashboard)
    : PAGE_COMPONENTS[currentPage];

  const activeTitle = isDashboard
    ? (ROLE_DASHBOARD_TITLE[role] ?? PAGE_TITLES.dashboard)
    : PAGE_TITLES[currentPage] ?? `${currentPage} Module`;

  // Sidebar only ever links to pages the role can view, but currentPage can
  // also be reached via navigate() calls elsewhere — re-check here so a
  // restricted page never renders just because a link to it exists somewhere.
  const isRestricted = !isDashboard && PageComponent && !canView(currentPage);

  return (
    <DashboardLayout
      activePage={currentPage}
      activeTitle={activeTitle}
      onNavigate={navigate}
    >
      {isRestricted ? (
        <div className="page-centered">
          <EmptyState
            icon={Lock}
            message="You do not have permission to view this page."
            actionLabel="Return to Dashboard"
            onAction={() => navigate('dashboard')}
          />
        </div>
      ) : PageComponent ? (
        <PageComponent />
      ) : (
        <div className="page-centered">
          <EmptyState
            icon={BarChart3}
            message="This module is coming soon."
            actionLabel="Return to Dashboard"
            onAction={() => navigate('dashboard')}
          />
        </div>
      )}
    </DashboardLayout>
  );
}

function AppGate() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  return isAuthenticated ? <AppContent /> : <AuthScreen />;
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <NavigationProvider>
            <AppGate />
          </NavigationProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
