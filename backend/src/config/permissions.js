// Server-side source of truth for role-based access.
// Mirrors the matrix the frontend used to hardcode in AuthContext.jsx —
// keep the two in sync if a role's access ever changes.
// 'F' = full, 'R' = read-only, 'L' = limited, null = no access
export const ROLES = ['admin', 'doctor', 'receptionist', 'pharmacist', 'billing'];

export const PERMISSIONS = {
  admin:        { dashboard: 'F', patients: 'F', doctors: 'F', staff: 'F', appointments: 'F', prescriptions: 'R', 'medical-history': 'R', billing: 'F', inventory: 'F', reports: 'F', 'audit-logs': 'R' },
  doctor:       { dashboard: 'R', patients: 'L', doctors: null, staff: null, appointments: 'R', prescriptions: 'F', 'medical-history': 'F', billing: null, inventory: null, reports: null, 'audit-logs': null },
  receptionist: { dashboard: 'R', patients: 'F', doctors: 'R', staff: null, appointments: 'F', prescriptions: null, 'medical-history': null, billing: null, inventory: null, reports: null, 'audit-logs': null },
  pharmacist:   { dashboard: 'R', patients: null, doctors: null, staff: null, appointments: null, prescriptions: 'L', 'medical-history': null, billing: null, inventory: 'F', reports: null, 'audit-logs': null },
  billing:      { dashboard: 'R', patients: 'R', doctors: null, staff: null, appointments: 'R', prescriptions: null, 'medical-history': null, billing: 'F', inventory: null, reports: null, 'audit-logs': null },
};

export const accessFor = (role, moduleId) => PERMISSIONS[role]?.[moduleId] ?? null;
