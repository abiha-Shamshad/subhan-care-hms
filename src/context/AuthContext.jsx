import { createContext, useContext, useState } from 'react';

// Permission matrix: role → set of module IDs with access level
// 'F' = full, 'R' = read-only, 'L' = limited, null = no access
const PERMISSIONS = {
  admin:        { dashboard: 'F', patients: 'F', doctors: 'F', staff: 'F', appointments: 'F', prescriptions: 'R', 'medical-history': 'R', billing: 'F', inventory: 'F', reports: 'F', 'audit-logs': 'R' },
  doctor:       { dashboard: 'R', patients: 'L', doctors: null, staff: null, appointments: null, prescriptions: 'F', 'medical-history': 'F', billing: null, inventory: null, reports: null, 'audit-logs': null },
  receptionist: { dashboard: 'R', patients: 'F', doctors: 'R', staff: null, appointments: 'F', prescriptions: null, 'medical-history': null, billing: null, inventory: null, reports: null, 'audit-logs': null },
  pharmacist:   { dashboard: 'R', patients: null, doctors: null, staff: null, appointments: null, prescriptions: 'L', 'medical-history': null, billing: null, inventory: 'F', reports: null, 'audit-logs': null },
  billing:      { dashboard: 'R', patients: null, doctors: null, staff: null, appointments: null, prescriptions: null, 'medical-history': null, billing: 'F', inventory: null, reports: null, 'audit-logs': null },
};

// Mock credential store — maps email → { password, role, name }
const MOCK_USERS = {
  'admin@subhancare.pk':        { password: 'Admin@123',   role: 'admin',        name: 'Dr. Subhan Ahmed' },
  'doctor@subhancare.pk':       { password: 'Doctor@123',  role: 'doctor',       name: 'Dr. Fatima Noor'  },
  'receptionist@subhancare.pk': { password: 'Recept@123',  role: 'receptionist', name: 'Sara Malik'       },
  'pharmacist@subhancare.pk':   { password: 'Pharma@123',  role: 'pharmacist',   name: 'Hassan Raza'      },
  'billing@subhancare.pk':      { password: 'Billing@123', role: 'billing',      name: 'Aisha Butt'       },
};

export const ROLES = ['admin', 'doctor', 'receptionist', 'pharmacist', 'billing'];

export const ROLE_LABELS = {
  admin:        'Administrator',
  doctor:       'Doctor',
  receptionist: 'Receptionist',
  pharmacist:   'Pharmacist',
  billing:      'Billing Staff',
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [role,            setRole]            = useState(null);
  const [user,            setUser]            = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = (email, password) => {
    const match = MOCK_USERS[email.toLowerCase()];
    if (!match || match.password !== password) {
      return { success: false, error: 'Invalid email or password. Please try again.' };
    }
    setRole(match.role);
    setUser({ name: match.name, email: email.toLowerCase(), role: match.role });
    setIsAuthenticated(true);
    return { success: true };
  };

  const logout = () => {
    setRole(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  /** Returns the access level string ('F','R','L') or null if no access */
  const access = (moduleId) => (role ? PERMISSIONS[role]?.[moduleId] ?? null : null);

  /** True if role has any access to the module */
  const canView = (moduleId) => access(moduleId) !== null;

  /** True only if role has full CRUD */
  const canEdit = (moduleId) => access(moduleId) === 'F';

  return (
    <AuthContext.Provider value={{
      role, user, isAuthenticated,
      login, logout,
      access, canView, canEdit,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
