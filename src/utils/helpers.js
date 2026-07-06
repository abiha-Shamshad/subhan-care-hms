/**
 * Calculates age in years from a date-of-birth string.
 * @param {string} dob - ISO date string (YYYY-MM-DD)
 * @returns {number}
 */
export const calculateAge = (dob) => {
  if (!dob) return 0;
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

/**
 * Generates initials (up to 2 characters) from a full name.
 * @param {string} name
 * @returns {string}
 */
export const getInitials = (name) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

/**
 * Generates a sequential ID with a given prefix and zero-padded number.
 * @param {string} prefix - e.g. 'PT', 'APT', 'RX'
 * @param {number} count  - current array length (new index = count + 1)
 * @param {number} pad    - zero-padding width (default 3)
 * @returns {string}
 */
export const generateId = (prefix, count, pad = 3) =>
  `${prefix}-${String(count + 1).padStart(pad, '0')}`;

/**
 * Validates a Pakistani phone number (03XX-XXXXXXX or 03XXXXXXXXX).
 * @param {string} phone
 * @returns {boolean}
 */
export const isValidPhone = (phone) =>
  /^03\d{2}-\d{7}$|^03\d{9}$/.test(phone);

/**
 * Validates a Pakistani CNIC (XXXXX-XXXXXXX-X).
 * @param {string} cnic
 * @returns {boolean}
 */
export const isValidCnic = (cnic) =>
  /^\d{5}-\d{7}-\d{1}$/.test(cnic);

/**
 * Validates an email address.
 * @param {string} email
 * @returns {boolean}
 */
export const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

/**
 * Returns today's date as a YYYY-MM-DD string.
 * @returns {string}
 */
export const todayISO = () => new Date().toISOString().split('T')[0];
