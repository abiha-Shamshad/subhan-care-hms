import { Users, Stethoscope, CalendarCheck, Activity } from 'lucide-react';
import '../pages/LoginPage.css';

const STATS = [
  { Icon: Users,         value: '247', label: 'Active Patients'      },
  { Icon: Stethoscope,   value: '18',  label: 'Doctors on Duty'      },
  { Icon: CalendarCheck, value: '32',  label: "Today's Appointments" },
  { Icon: Activity,      value: '94%', label: 'Satisfaction Rate'    },
];

/**
 * Shared shell for every authentication screen (Login, Forgot Password, OTP,
 * Reset, Success). Renders the branded two-panel card; each screen supplies
 * only its form content as children — keeps the auth flow DRY.
 */
const AuthLayout = ({ children }) => (
  <div className="login-page">
    <div className="lp-bg-blob lp-bg-blob--1" aria-hidden="true" />
    <div className="lp-bg-blob lp-bg-blob--2" aria-hidden="true" />

    <div className="lp-card" role="main">
      <header className="lp-card-header">
        <div className="lp-header-brand">
          <div className="lp-header-logo" aria-hidden="true">SC</div>
          <span className="lp-header-name">Subhan Care</span>
        </div>
      </header>

      <div className="lp-card-body">
        <div className="lp-form-side">{children}</div>

        <div className="lp-visual-side" aria-hidden="true">
          <div className="lp-visual-circle">
            <div className="lp-stats-grid">
              {STATS.map(({ Icon, value, label }) => (
                <div key={label} className="lp-stat-card">
                  <div className="lp-stat-icon-wrap">
                    <Icon size={13} aria-hidden="true" />
                  </div>
                  <span className="lp-stat-value">{value}</span>
                  <span className="lp-stat-label">{label}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="lp-visual-tagline">
            We take care of your{' '}
            <span className="lp-accent--primary">Management</span>.
            <br />
            You take care of{' '}
            <span className="lp-accent--success">Patients</span>.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default AuthLayout;
