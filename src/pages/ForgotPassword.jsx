import { useState } from 'react';
import { Mail, ArrowLeft, Loader2, AlertCircle, KeyRound } from 'lucide-react';
import { isValidEmail } from '../utils/helpers';
import AuthLayout from '../components/AuthLayout';
import './LoginPage.css';

/**
 * Step 1 of password recovery — collect the account email and "send" a code.
 * `onSent(email)` advances to the OTP screen; `onBack` returns to Login.
 */
const ForgotPassword = ({ initialEmail = '', onSent, onBack }) => {
  const [email,   setEmail]   = useState(initialEmail);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return setError('Email is required.');
    if (!isValidEmail(email.trim())) return setError('Enter a valid email address.');

    setError('');
    setLoading(true);
    // Placeholder: authService.requestPasswordReset(email) once the API is live.
    setTimeout(() => {
      setLoading(false);
      onSent(email.trim());
    }, 700);
  };

  return (
    <AuthLayout>
      <div className="lp-auth-icon" aria-hidden="true">
        <KeyRound size={22} />
      </div>
      <h2 className="lp-form-title">Forgot your password?</h2>
      <p className="lp-form-lead">
        Enter the email linked to your account and we’ll send a 6-digit
        verification code to reset your password.
      </p>

      {error && (
        <div className="lp-error lp-error--visible" role="alert" aria-live="assertive">
          <AlertCircle size={15} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <form className="lp-form" onSubmit={handleSubmit} noValidate>
        <div className={`form-field ${error ? 'has-error' : ''}`}>
          <label htmlFor="fp-email">Account Email</label>
          <div className="lp-input-wrap">
            <Mail size={15} className="lp-input-icon" aria-hidden="true" />
            <input
              id="fp-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder="you@subhancare.pk"
              required
              className="lp-has-icon"
            />
          </div>
        </div>

        <button type="submit" className="lp-submit-btn" disabled={loading} aria-busy={loading}>
          {loading ? (
            <><Loader2 size={16} className="lp-spinner" aria-hidden="true" /> Sending code…</>
          ) : 'Send reset code'}
        </button>
      </form>

      <button type="button" className="lp-back-link" onClick={onBack}>
        <ArrowLeft size={15} aria-hidden="true" /> Back to login
      </button>
    </AuthLayout>
  );
};

export default ForgotPassword;
