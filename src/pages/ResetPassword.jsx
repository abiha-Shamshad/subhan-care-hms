import { useState } from 'react';
import { Lock, Eye, EyeOff, Loader2, AlertCircle, Check, Sparkles } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import './LoginPage.css';

const RULES = [
  { id: 'length', label: 'At least 8 characters', test: (v) => v.length >= 8 },
  { id: 'upper',  label: 'One uppercase letter',  test: (v) => /[A-Z]/.test(v) },
  { id: 'number', label: 'One number',            test: (v) => /\d/.test(v) },
  { id: 'symbol', label: 'One special character', test: (v) => /[^A-Za-z0-9]/.test(v) },
];

/**
 * Step 3 of recovery — set a new password. Enforces strength rules and match,
 * then calls `onReset` to show the success screen.
 */
const ResetPassword = ({ onReset }) => {
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const passed = RULES.filter(r => r.test(password));
  const allRulesMet = passed.length === RULES.length;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!allRulesMet) return setError('Password does not meet all requirements.');
    if (password !== confirm) return setError('Passwords do not match.');

    setError('');
    setLoading(true);
    // Placeholder: authService.resetPassword(email, password, token) once the API is live.
    setTimeout(() => {
      setLoading(false);
      onReset();
    }, 700);
  };

  return (
    <AuthLayout>
      <div className="lp-auth-icon" aria-hidden="true">
        <Sparkles size={22} />
      </div>
      <h2 className="lp-form-title">Create a new password</h2>
      <p className="lp-form-lead">
        Your new password must be different from previously used passwords.
      </p>

      {error && (
        <div className="lp-error lp-error--visible" role="alert" aria-live="assertive">
          <AlertCircle size={15} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <form className="lp-form" onSubmit={handleSubmit} noValidate>
        <div className="form-field">
          <label htmlFor="rp-password">New Password</label>
          <div className="lp-pw-wrap">
            <Lock size={15} className="lp-input-icon" aria-hidden="true" />
            <input
              id="rp-password"
              type={showPw ? 'text' : 'password'}
              autoComplete="new-password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="New password"
              required
              className="lp-has-icon"
            />
            <button
              type="button"
              className="lp-eye-btn"
              onClick={() => setShowPw(p => !p)}
              aria-label={showPw ? 'Hide password' : 'Show password'}
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <ul className="lp-rules" aria-label="Password requirements">
          {RULES.map(rule => {
            const ok = rule.test(password);
            return (
              <li key={rule.id} className={`lp-rule ${ok ? 'lp-rule--ok' : ''}`}>
                <Check size={13} aria-hidden="true" />
                <span>{rule.label}</span>
              </li>
            );
          })}
        </ul>

        <div className="form-field">
          <label htmlFor="rp-confirm">Confirm Password</label>
          <div className="lp-pw-wrap">
            <Lock size={15} className="lp-input-icon" aria-hidden="true" />
            <input
              id="rp-confirm"
              type={showPw ? 'text' : 'password'}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => { setConfirm(e.target.value); setError(''); }}
              placeholder="Re-enter password"
              required
              className="lp-has-icon"
            />
          </div>
        </div>

        <button type="submit" className="lp-submit-btn" disabled={loading} aria-busy={loading}>
          {loading ? (
            <><Loader2 size={16} className="lp-spinner" aria-hidden="true" /> Updating…</>
          ) : 'Reset password'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
