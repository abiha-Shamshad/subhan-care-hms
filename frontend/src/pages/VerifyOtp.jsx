import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import './LoginPage.css';

const OTP_LENGTH = 6;
const DEMO_CODE = '123456'; // Placeholder — real code arrives via authService.

/**
 * Step 2 of recovery — verify the 6-digit code. `onVerified` advances to the
 * reset screen. Includes per-digit inputs, paste support, and a resend timer.
 */
const VerifyOtp = ({ email, onVerified, onBack }) => {
  const [digits,    setDigits]    = useState(Array(OTP_LENGTH).fill(''));
  const [error,     setError]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [resendIn,  setResendIn]  = useState(30);
  const inputsRef = useRef([]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  // Resend countdown.
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const setDigit = (index, value) => {
    const char = value.replace(/\D/g, '').slice(-1);
    setDigits(prev => {
      const next = [...prev];
      next[index] = char;
      return next;
    });
    setError('');
    if (char && index < OTP_LENGTH - 1) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill('');
    pasted.split('').forEach((c, i) => { next[i] = c; });
    setDigits(next);
    setError('');
    inputsRef.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const code = digits.join('');
    if (code.length < OTP_LENGTH) return setError('Enter all 6 digits of the code.');

    setError('');
    setLoading(true);
    // Placeholder: authService.verifyOtp(email, code) once the API is live.
    setTimeout(() => {
      setLoading(false);
      if (code === DEMO_CODE) {
        onVerified(code);
      } else {
        setError('Invalid or expired code. Please try again.');
        setDigits(Array(OTP_LENGTH).fill(''));
        inputsRef.current[0]?.focus();
      }
    }, 700);
  };

  const handleResend = () => {
    setResendIn(30);
    setDigits(Array(OTP_LENGTH).fill(''));
    setError('');
    inputsRef.current[0]?.focus();
  };

  return (
    <AuthLayout>
      <div className="lp-auth-icon" aria-hidden="true">
        <ShieldCheck size={22} />
      </div>
      <h2 className="lp-form-title">Verify your identity</h2>
      <p className="lp-form-lead">
        We sent a 6-digit code to{' '}
        <strong>{email || 'your email'}</strong>. Enter it below to continue.
      </p>

      <p className="lp-otp-hint" role="note">Demo code: <strong>123456</strong></p>

      {error && (
        <div className="lp-error lp-error--visible" role="alert" aria-live="assertive">
          <AlertCircle size={15} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <form className="lp-form" onSubmit={handleSubmit} noValidate>
        <div className="lp-otp-group" onPaste={handlePaste} role="group" aria-label="6-digit verification code">
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputsRef.current[i] = el; }}
              className={`lp-otp-input ${error ? 'has-error' : ''}`}
              type="text"
              inputMode="numeric"
              autoComplete={i === 0 ? 'one-time-code' : 'off'}
              maxLength={1}
              value={digit}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              aria-label={`Digit ${i + 1}`}
            />
          ))}
        </div>

        <button type="submit" className="lp-submit-btn" disabled={loading} aria-busy={loading}>
          {loading ? (
            <><Loader2 size={16} className="lp-spinner" aria-hidden="true" /> Verifying…</>
          ) : 'Verify code'}
        </button>
      </form>

      <p className="lp-resend">
        Didn’t receive it?{' '}
        {resendIn > 0 ? (
          <span className="lp-resend-timer">Resend in {resendIn}s</span>
        ) : (
          <button type="button" className="lp-forgot-link" onClick={handleResend}>Resend code</button>
        )}
      </p>

      <button type="button" className="lp-back-link" onClick={onBack}>
        <ArrowLeft size={15} aria-hidden="true" /> Back to login
      </button>
    </AuthLayout>
  );
};

export default VerifyOtp;
