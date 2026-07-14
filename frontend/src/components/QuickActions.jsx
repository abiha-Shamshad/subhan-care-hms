import { UserPlus, CalendarPlus, FileText } from 'lucide-react';
import './QuickActions.css';

const QuickActions = ({ onRegisterPatient, onAddAppointment, onGenerateReport }) => {
  return (
    <section className="quick-actions" aria-labelledby="quick-actions-title">
      <h2 id="quick-actions-title" className="quick-actions-title">Quick Actions</h2>
      <div className="quick-actions-grid">
        <button
          className="quick-action-btn quick-action-btn--primary"
          onClick={onRegisterPatient}
          aria-label="Register a new patient"
        >
          <UserPlus size={18} aria-hidden="true" />
          <span>Register Patient</span>
        </button>

        <button
          className="quick-action-btn quick-action-btn--secondary"
          onClick={onAddAppointment}
          aria-label="Schedule a new appointment"
        >
          <CalendarPlus size={18} aria-hidden="true" />
          <span>Add Appointment</span>
        </button>

        <button
          className="quick-action-btn quick-action-btn--outline"
          onClick={onGenerateReport}
          aria-label="Generate system and clinic reports"
        >
          <FileText size={18} aria-hidden="true" />
          <span>Generate Report</span>
        </button>
      </div>
    </section>
  );
};

export default QuickActions;
// Export dummy functions in default imports or define in parent page component
