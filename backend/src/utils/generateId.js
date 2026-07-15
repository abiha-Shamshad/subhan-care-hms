/**
 * Generates the next sequential display id for a collection, e.g. 'PT-1001', 'APT-007'.
 * Looks at the highest existing numeric suffix for the given prefix and increments it.
 */
export const nextId = async (Model, field, prefix, { padLength = 3, startAt = 1 } = {}) => {
  const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`^${escaped}-(\\d+)$`);

  const docs = await Model.find({ [field]: regex }).select(field).lean();
  const maxNum = docs.reduce((max, doc) => {
    const match = regex.exec(doc[field]);
    const num = match ? parseInt(match[1], 10) : 0;
    return Math.max(max, num);
  }, startAt - 1);

  const next = maxNum + 1;
  return `${prefix}-${String(next).padStart(padLength, '0')}`;
};
