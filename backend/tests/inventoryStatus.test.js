import { deriveInventoryStatus } from '../src/utils/inventoryStatus.js';

describe('deriveInventoryStatus', () => {
  it('returns out-of-stock when quantity is zero', () => {
    expect(deriveInventoryStatus(0, 10)).toBe('out-of-stock');
  });

  it('returns low-stock when quantity is at or below the reorder level', () => {
    expect(deriveInventoryStatus(10, 10)).toBe('low-stock');
    expect(deriveInventoryStatus(5, 10)).toBe('low-stock');
  });

  it('returns in-stock when quantity is above the reorder level', () => {
    expect(deriveInventoryStatus(50, 10)).toBe('in-stock');
  });
});
