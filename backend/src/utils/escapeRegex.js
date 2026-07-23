export const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Builds a case-insensitive RegExp from user search input, safe against ReDoS
 * and operator injection: non-strings are rejected and the input is escaped
 * and length-capped before being compiled. */
export const safeSearchRegex = (value, { maxLength = 100 } = {}) => {
  if (typeof value !== 'string' || !value) return null;
  return new RegExp(escapeRegex(value.slice(0, maxLength)), 'i');
};
