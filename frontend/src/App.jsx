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
import EmptyState from './components/EmptyState';
import { BarChart3 } from 'lucide-react';

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
  const { role } = useAuth();

  const isDashboard = currentPage === 'dashboard';
  const PageComponent = isDashboard
    ? (ROLE_DASHBOARD[role] ?? Dashboard)
    : PAGE_COMPONENTS[currentPage];

  const activeTitle = isDashboard
    ? (ROLE_DASHBOARD_TITLE[role] ?? PAGE_TITLES.dashboard)
    : PAGE_TITLES[currentPage] ?? `${currentPage} Module`;

  return (
    <DashboardLayout
      activePage={currentPage}
      activeTitle={activeTitle}
      onNavigate={navigate}
    >
      {PageComponent ? (
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
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <AppContent /> : <AuthScreen />;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NavigationProvider>
          <AppGate />
        </NavigationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
