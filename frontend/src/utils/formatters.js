/**
 * Formats a number as Pakistani Rupees.
 * @param {number} amount
 * @returns {string} e.g. "Rs. 1,500"
 */
export const formatCurrency = (amount) =>
  `Rs. ${Number(amount || 0).toLocaleString('en-PK')}`;

/**
 * Formats an ISO date string to a human-readable format.
 * @param {string} isoDate - YYYY-MM-DD
 * @param {object} [opts]  - Intl.DateTimeFormat options
 * @returns {string}
 */
export const formatDate = (isoDate, opts = { day: '2-digit', month: 'short', year: 'numeric' }) => {
  if (!isoDate) return '—';
  return new Date(isoDate).toLocaleDateString('en-GB', opts);
};

/**
 * Formats an ISO timestamp to locale date + time string.
 * @param {string} isoTimestamp
 * @returns {string}
 */
export const formatDateTime = (isoTimestamp) => {
  if (!isoTimestamp) return '—';
  return new Date(isoTimestamp).toLocaleString('en-GB');
};

/**
 * Capitalises the first letter of a string.
 * @param {string} str
 * @returns {string}
 */
export const capitalise = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

/**
 * Truncates text to maxLen characters, appending '…' if cut.
 * @param {string} text
 * @param {number} maxLen
 * @returns {string}
 */
export const truncate = (text, maxLen = 80) =>
  text && text.length > maxLen ? `${text.slice(0, maxLen)}…` : text;
