import { CheckCircle2 } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import './LoginPage.css';

/**
 * Final step of recovery — confirmation. `onDone` returns to the Login screen.
 */
const ResetSuccess = ({ onDone }) => (
  <AuthLayout>
    <div className="lp-success">
      <div className="lp-success-icon" aria-hidden="true">
        <CheckCircle2 size={40} />
      </div>
      <h2 className="lp-form-title lp-success-title">Password reset complete</h2>
      <p className="lp-form-lead lp-success-lead">
        Your password has been updated successfully. You can now log in with
        your new credentials.
      </p>
      <button type="button" className="lp-submit-btn lp-success-btn" onClick={onDone}>
        Back to login
      </button>
    </div>
  </AuthLayout>
);

export default ResetSuccess;
