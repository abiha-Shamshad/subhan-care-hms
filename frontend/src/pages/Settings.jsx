import { useState } from 'react';
import { KeyRound, User as UserIcon, Palette, ShieldCheck } from 'lucide-react';
import { useAuth, ROLE_LABELS } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import StatusBadge from '../components/StatusBadge';
import LoadingSkeleton from '../components/LoadingSkeleton';
import useToast from '../hooks/useToast';
import useApiResource from '../hooks/useApiResource';
import { authService } from '../services/api';
import { NAVIGATION_ITEMS } from '../constants/navigation';
import './Settings.css';

const MODULE_LABELS = NAVIGATION_ITEMS.reduce((acc, item) => {
  acc[item.id] = item.label;
  return acc;
}, {});

const ACCESS_LABELS = { F: 'Full', R: 'Read-only', L: 'Limited' };

const Settings = () => {
  const { user, role } = useAuth();
  const { theme } = useTheme();
  const { toast, showToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = role === 'admin';
  const { data: matrix, loading: matrixLoading } = useApiResource(
    () => (isAdmin ? authService.permissionsMatrix() : Promise.resolve(null)),
    [isAdmin]
  );

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!currentPassword) nextErrors.currentPassword = 'Current password is required.';
    if (!newPassword || newPassword.length < 6) nextErrors.newPassword = 'New password must be at least 6 characters.';
    if (newPassword !== confirmPassword) nextErrors.confirmPassword = 'Passwords do not match.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      showToast('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setErrors({ form: err.message || 'Failed to update password.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="st-page">
      <div className="page-header">
        <div>
          <h2>Settings</h2>
          <p className="page-subtitle">Manage your profile, security, and preferences</p>
        </div>
      </div>

      <div className="st-grid">
        <div className="st-card">
          <div className="st-card-title"><UserIcon size={18} /><h3>Profile</h3></div>
          <div className="st-profile-row">
            <span className="text-secondary">Name</span>
            <span className="cell-bold">{user?.name}</span>
          </div>
          <div className="st-profile-row">
            <span className="text-secondary">Email</span>
            <span className="cell-bold">{user?.email}</span>
          </div>
          <div className="st-profile-row">
            <span className="text-secondary">Role</span>
            <StatusBadge status={role} customLabel={ROLE_LABELS[role]} />
          </div>
        </div>

        <div className="st-card">
          <div className="st-card-title"><Palette size={18} /><h3>Appearance</h3></div>
          <div className="st-profile-row">
            <span className="text-secondary">Theme</span>
            <div className="st-theme-control">
              <span className="text-muted">{theme === 'dark' ? 'Dark mode' : 'Light mode'}</span>
              <ThemeToggle />
            </div>
          </div>
        </div>

        <div className="st-card">
          <div className="st-card-title"><KeyRound size={18} /><h3>Change Password</h3></div>
          <form className="modal-form" onSubmit={handlePasswordSubmit}>
            {errors.form && <p className="field-error">{errors.form}</p>}
            <div className={`form-field ${errors.currentPassword ? 'has-error' : ''}`}>
              <label htmlFor="currentPassword">Current Password</label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
              />
              {errors.currentPassword && <span className="field-error">{errors.currentPassword}</span>}
            </div>
            <div className={`form-field ${errors.newPassword ? 'has-error' : ''}`}>
              <label htmlFor="newPassword">New Password</label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
              {errors.newPassword && <span className="field-error">{errors.newPassword}</span>}
            </div>
            <div className={`form-field ${errors.confirmPassword ? 'has-error' : ''}`}>
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
              {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
            </div>
            <div className="modal-actions modal-actions--borderless">
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>

        {isAdmin && (
          <div className="st-card st-card--wide">
            <div className="st-card-title"><ShieldCheck size={18} /><h3>Permissions Overview</h3></div>
            <p className="page-subtitle">Read-only view of each role's access level per module</p>
            {matrixLoading ? (
              <LoadingSkeleton variant="text" count={5} />
            ) : (
              <div className="table-container st-matrix-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Module</th>
                      {matrix?.roles.map((r) => <th key={r}>{ROLE_LABELS[r]}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(MODULE_LABELS).map((moduleId) => (
                      <tr key={moduleId}>
                        <td className="cell-name">{MODULE_LABELS[moduleId]}</td>
                        {matrix?.roles.map((r) => {
                          const access = matrix.permissions[r]?.[moduleId] ?? null;
                          return (
                            <td key={r}>
                              {access ? (
                                <span className={`badge badge--${access === 'F' ? 'green' : access === 'R' ? 'blue' : 'amber'}`}>
                                  {ACCESS_LABELS[access]}
                                </span>
                              ) : (
                                <span className="text-muted">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {toast && <div className="toast toast--success" role="status">{toast}</div>}
    </div>
  );
};

export default Settings;
