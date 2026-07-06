import { useState } from 'react';
import { Search, ChevronDown, ScrollText, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import EmptyState from '../components/EmptyState';
import './AuditLogs.css';

const ACTION_TYPES = ['LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'VIEW', 'PRINT', 'RESET_PW'];

const ACTION_BADGE_CLASS = {
  LOGIN:    'badge--green',
  LOGOUT:   'badge--gray',
  CREATE:   'badge--blue',
  UPDATE:   'badge--amber',
  DELETE:   'badge--red',
  VIEW:     'badge--gray',
  PRINT:    'badge--gray',
  RESET_PW: 'badge--amber',
};

const AUDIT_LOGS = [
  { id: 'LOG-001', timestamp: '2026-07-03T09:14:22', user: 'Ahmed Siddiqui (admin)',       action: 'LOGIN',    resource: 'System',              details: 'Successful login from 192.168.1.10',                              ip: '192.168.1.10' },
  { id: 'LOG-002', timestamp: '2026-07-03T09:15:08', user: 'Ahmed Siddiqui (admin)',       action: 'VIEW',     resource: 'Patient PT-1001',      details: 'Viewed patient profile for Ahmed Khan',                          ip: '192.168.1.10' },
  { id: 'LOG-003', timestamp: '2026-07-03T09:20:45', user: 'Dr. Fatima Noor (doctor)',     action: 'CREATE',   resource: 'Prescription RX-003',  details: 'Created new prescription for Hassan Raza (PT-1003)',             ip: '192.168.1.14' },
  { id: 'LOG-004', timestamp: '2026-07-03T09:32:11', user: 'Zara Shah (receptionist)',     action: 'CREATE',   resource: 'Appointment APT-007',  details: 'Booked appointment for Tariq Butt with Dr. Bilal Mahmood',      ip: '192.168.1.22' },
  { id: 'LOG-005', timestamp: '2026-07-03T10:05:30', user: 'Ahmed Siddiqui (admin)',       action: 'UPDATE',   resource: 'Staff ST-005',          details: 'Deactivated staff account for Nadia Qureshi',                   ip: '192.168.1.10' },
  { id: 'LOG-006', timestamp: '2026-07-03T10:18:54', user: 'Imran Butt (pharmacist)',      action: 'UPDATE',   resource: 'Prescription RX-001',  details: 'Marked prescription RX-001 as dispensed',                       ip: '192.168.1.31' },
  { id: 'LOG-007', timestamp: '2026-07-03T10:45:00', user: 'Nadia Qureshi (billing)',      action: 'CREATE',   resource: 'Invoice INV-003',       details: 'Created invoice for Hassan Raza (PT-1003)',                      ip: '192.168.1.18' },
  { id: 'LOG-008', timestamp: '2026-07-03T11:00:15', user: 'Ahmed Siddiqui (admin)',       action: 'RESET_PW', resource: 'Staff ST-004',          details: 'Password reset email sent to imran.butt@subhancare.pk',         ip: '192.168.1.10' },
  { id: 'LOG-009', timestamp: '2026-07-03T11:22:40', user: 'Dr. Fatima Noor (doctor)',     action: 'CREATE',   resource: 'MedHistory MH-005',     details: 'Appended medical history entry for Sara Malik (PT-1002)',       ip: '192.168.1.14' },
  { id: 'LOG-010', timestamp: '2026-07-03T12:10:05', user: 'Nadia Qureshi (billing)',      action: 'PRINT',    resource: 'Invoice INV-001',       details: 'Printed invoice INV-001 for Ahmed Khan',                        ip: '192.168.1.18' },
];

const AuditLogs = () => {
  const { canView } = useAuth();
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterDate, setFilterDate] = useState('');

  if (!canView('audit-logs')) {
    return (
      <div className="page-centered">
        <EmptyState icon={Shield} message="You do not have permission to view Audit Logs." />
      </div>
    );
  }

  const filtered = AUDIT_LOGS.filter((log) => {
    const q = search.toLowerCase();
    return (
      (log.user.toLowerCase().includes(q) ||
       log.details.toLowerCase().includes(q) ||
       log.resource.toLowerCase().includes(q)) &&
      (!filterAction || log.action === filterAction) &&
      (!filterDate || log.timestamp.startsWith(filterDate))
    );
  });

  return (
    <div className="audit-page">
      <div className="page-header">
        <div>
          <h2>Audit Logs</h2>
          <p className="page-subtitle">Read-only system event log — {AUDIT_LOGS.length} entries</p>
        </div>
      </div>

      <div className="table-controls">
        <div className="search-box">
          <Search size={16} aria-hidden="true" />
          <input
            type="search"
            placeholder="Search by user, resource, or details…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search audit logs"
          />
        </div>
        <div className="filter-group">
          <ChevronDown size={14} className="filter-icon" aria-hidden="true" />
          <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)} aria-label="Filter by action type">
            <option value="">All Actions</option>
            {ACTION_TYPES.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <input
          type="date"
          className="filter-date-input"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          aria-label="Filter by date"
        />
      </div>

      <div className="table-container">
        {filtered.length === 0 ? (
          <EmptyState
            icon={ScrollText}
            message="No audit log entries match your search."
            actionLabel="Clear Filters"
            onAction={() => { setSearch(''); setFilterAction(''); setFilterDate(''); }}
          />
        ) : (
          <table className="data-table" aria-label="System audit log">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Resource</th>
                <th>Details</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => (
                <tr key={log.id}>
                  <td className="text-muted">{new Date(log.timestamp).toLocaleString('en-GB')}</td>
                  <td className="text-secondary">{log.user}</td>
                  <td><span className={`badge ${ACTION_BADGE_CLASS[log.action] || 'badge--gray'}`}>{log.action}</span></td>
                  <td className="text-secondary">{log.resource}</td>
                  <td className="text-secondary">{log.details}</td>
                  <td><span className="log-ip">{log.ip}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
