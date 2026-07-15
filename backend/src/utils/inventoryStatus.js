export const deriveInventoryStatus = (quantity, reorderLevel) => {
  if (quantity === 0) return 'out-of-stock';
  if (quantity <= reorderLevel) return 'low-stock';
  return 'in-stock';
};
