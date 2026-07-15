import { useState, useEffect } from 'react';
import {
  Eye, EyeOff, ChevronDown, ChevronUp, AlertCircle,
  Mail, Lock, Loader2,
} from 'lucide-react';
import { useAuth, ROLE_LABELS } from '../context/AuthContext';
import { isValidEmail } from '../utils/helpers';
import AuthLayout from '../components/AuthLayout';
import './LoginPage.css';

const DEMO_CREDS = [
  { role: 'admin',        email: 'admin@subhancare.pk',        password: 'Admin@123'   },
  { role: 'doctor',       email: 'doctor@subhancare.pk',       password: 'Doctor@123'  },
  { role: 'receptionist', email: 'receptionist@subhancare.pk', password: 'Recept@123'  },
  { role: 'pharmacist',   email: 'pharmacist@subhancare.pk',   password: 'Pharma@123'  },
  { role: 'billing',      email: 'billing@subhancare.pk',      password: 'Billing@123' },
];

const REMEMBER_KEY = 'subhancare_remember_email';

/**
 * Login screen. `onForgotPassword` switches the auth flow to the recovery
 * sequence (handled by the parent AuthScreen).
 */
const LoginPage = ({ onForgotPassword }) => {
  const { login } = useAuth();

  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [remember,   setRemember]   = useState(false);
  const [showPw,     setShowPw]     = useState(false);
  const [error,      setError]      = useState('');
  const [fieldError, setFieldError] = useState({});
  const [loading,    setLoading]    = useState(false);
  const [showDemo,   setShowDemo]   = useState(false);

  // Restore a remembered email on mount.
  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_KEY);
    if (saved) {
      setEmail(saved);
      setRemember(true);
    }
  }, []);

  const validate = () => {
    const next = {};
    if (!email.trim())            next.email = 'Email is required.';
    else if (!isValidEmail(email.trim())) next.email = 'Enter a valid email address.';
    if (!password)                next.password = 'Password is required.';
    setFieldError(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    setLoading(true);
    const result = await login(email.trim(), password);
    if (result.success) {
      if (remember) localStorage.setItem(REMEMBER_KEY, email.trim());
      else localStorage.removeItem(REMEMBER_KEY);
      // On success the app unmounts this screen via the auth gate.
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  const applyDemoCredential = (cred) => {
    setEmail(cred.email);
    setPassword(cred.password);
    setError('');
    setFieldError({});
    setShowDemo(false);
  };

  return (
    <AuthLayout>
      <h2 className="lp-form-title">Login to your<br />Subhan Care Account</h2>

      <div
        className={`lp-error${error ? ' lp-error--visible' : ''}`}
        role="alert"
        aria-live="assertive"
      >
        <AlertCircle size={15} aria-hidden="true" />
        <span>{error}</span>
      </div>

      <form className="lp-form" onSubmit={handleSubmit} noValidate>
        <div className={`form-field ${fieldError.email ? 'has-error' : ''}`}>
          <label htmlFor="lp-email">Access Email</label>
          <div className="lp-input-wrap">
            <Mail size={15} className="lp-input-icon" aria-hidden="true" />
            <input
              id="lp-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); setFieldError(f => ({ ...f, email: undefined })); }}
              placeholder="Access email"
              required
              aria-invalid={!!fieldError.email}
              className="lp-has-icon"
            />
          </div>
          {fieldError.email && <span className="field-error">{fieldError.email}</span>}
        </div>

        <div className={`form-field ${fieldError.password ? 'has-error' : ''}`}>
          <label htmlFor="lp-password">Access Key</label>
          <div className="lp-pw-wrap">
            <Lock size={15} className="lp-input-icon" aria-hidden="true" />
            <input
              id="lp-password"
              type={showPw ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); setFieldError(f => ({ ...f, password: undefined })); }}
              placeholder="Access key"
              required
              aria-invalid={!!fieldError.password}
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
          {fieldError.password && <span className="field-error">{fieldError.password}</span>}
        </div>

        <div className="lp-form-options">
          <label className="lp-remember">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <span>Remember me</span>
          </label>
          <button
            type="button"
            className="lp-forgot-link"
            onClick={onForgotPassword}
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          className="lp-submit-btn"
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="lp-spinner" aria-hidden="true" />
              Signing in…
            </>
          ) : 'Sign in'}
        </button>
      </form>

      <div className="lp-divider" aria-hidden="true">
        <span>demo credentials</span>
      </div>

      <div className="lp-demo-section">
        <button
          className="lp-demo-toggle"
          onClick={() => setShowDemo(d => !d)}
          aria-expanded={showDemo}
          aria-controls="lp-demo-list"
        >
          <span>Try a role</span>
          {showDemo ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showDemo && (
          <ul id="lp-demo-list" className="lp-demo-list">
            {DEMO_CREDS.map(cred => (
              <li key={cred.role} className="lp-demo-card">
                <div className="lp-demo-info">
                  <span className="lp-demo-role">{ROLE_LABELS[cred.role]}</span>
                  <span className="lp-demo-email">{cred.email}</span>
                  <span className="lp-demo-pw">{cred.password}</span>
                </div>
                <button
                  className="lp-demo-use-btn"
                  onClick={() => applyDemoCredential(cred)}
                  aria-label={`Use ${ROLE_LABELS[cred.role]} demo credentials`}
                >
                  Use
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="lp-form-footer">
        By logging into the Subhan Care application you are agreeing to the{' '}
        <span className="lp-footer-link">Terms &amp; Conditions</span>.
      </p>
    </AuthLayout>
  );
};

export default LoginPage;
