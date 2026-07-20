import { accessFor, PERMISSIONS, ROLES } from '../src/config/permissions.js';

describe('accessFor', () => {
  it('returns the configured access level for a known role/module pair', () => {
    expect(accessFor('admin', 'billing')).toBe('F');
    expect(accessFor('doctor', 'prescriptions')).toBe('F');
    expect(accessFor('receptionist', 'appointments')).toBe('F');
  });

  it('returns null for a module the role has no access to', () => {
    expect(accessFor('pharmacist', 'billing')).toBeNull();
    expect(accessFor('billing', 'inventory')).toBeNull();
  });

  it('returns null for an unknown role', () => {
    expect(accessFor('nonexistent-role', 'dashboard')).toBeNull();
  });

  it('every role has an entry for every module referenced across the matrix', () => {
    const allModuleIds = new Set(ROLES.flatMap((role) => Object.keys(PERMISSIONS[role])));
    for (const role of ROLES) {
      for (const moduleId of allModuleIds) {
        expect(Object.prototype.hasOwnProperty.call(PERMISSIONS[role], moduleId)).toBe(true);
      }
    }
  });

  it('every role can view its own settings page', () => {
    for (const role of ROLES) {
      expect(accessFor(role, 'settings')).toBe('F');
    }
  });
});
