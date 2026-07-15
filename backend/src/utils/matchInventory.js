import InventoryItem from '../models/InventoryItem.js';

/** Lowercases, strips dosage tokens (500mg, 10 ml, ...) and collapses whitespace. */
const normalize = (str) =>
  (str || '')
    .toLowerCase()
    .replace(/\d+(\.\d+)?\s*(mg|ml|mcg|g|iu)\b/g, '')
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Dispensing a prescription decrements matching InventoryItem stock by one unit
 * per medication line. Medication names are free text ("Aspirin 75mg") while
 * inventory names are also free text ("Paracetamol 500mg") — there's no reliable
 * quantity to parse out of dosage/frequency/duration, so this is a deliberate
 * simplification (1 unit/line), not an attempt at exact dispensed-quantity tracking.
 * A medication with no confident match is skipped with a warning — dispensing never
 * fails because of an inventory mismatch.
 */
export const deductForMedications = async (medications) => {
  const items = await InventoryItem.find({ quantity: { $gt: 0 } });
  const deductions = [];
  const warnings = [];

  for (const med of medications) {
    const target = normalize(med.name);
    let match = items.find((item) => normalize(item.name) === target);
    if (!match && target) {
      match = items.find((item) => {
        const itemName = normalize(item.name);
        return itemName.includes(target) || target.includes(itemName);
      });
    }

    if (!match) {
      warnings.push(`No inventory match found for "${med.name}" — stock not adjusted.`);
      deductions.push({ medicationName: med.name, matchedItemId: null, matchedItemName: null, quantityDeducted: 0, matched: false });
      continue;
    }

    match.quantity = Math.max(0, match.quantity - 1);
    await match.save();

    deductions.push({ medicationName: med.name, matchedItemId: match._id, matchedItemName: match.name, quantityDeducted: 1, matched: true });
  }

  return { deductions, warnings };
};
