import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, getToken, setToken, clearToken, onUnauthorized } from '../services/api';

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
  const [permissions,     setPermissions]     = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading,       setIsLoading]       = useState(true);

  const hydrateSession = useCallback(async () => {
    const { user: me } = await authService.me();
    const { permissions: perms } = await authService.permissions();
    setUser(me);
    setRole(me.role);
    setPermissions(perms);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setRole(null);
    setUser(null);
    setPermissions({});
    setIsAuthenticated(false);
  }, []);

  useEffect(() => {
    onUnauthorized(logout);
  }, [logout]);

  useEffect(() => {
    (async () => {
      if (getToken()) {
        try {
          await hydrateSession();
        } catch {
          clearToken();
        }
      }
      setIsLoading(false);
    })();
  }, [hydrateSession]);

  const login = async (email, password) => {
    try {
      const { token } = await authService.login(email, password);
      setToken(token);
      await hydrateSession();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'Invalid email or password. Please try again.' };
    }
  };

  /** Returns the access level string ('F','R','L') or null if no access */
  const access = (moduleId) => (role ? permissions[moduleId] ?? null : null);

  /** True if role has any access to the module */
  const canView = (moduleId) => access(moduleId) !== null;

  /** True only if role has full CRUD */
  const canEdit = (moduleId) => access(moduleId) === 'F';

  return (
    <AuthContext.Provider value={{
      role, user, isAuthenticated, isLoading,
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
