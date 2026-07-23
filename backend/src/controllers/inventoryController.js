import InventoryItem from '../models/InventoryItem.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { nextId } from '../utils/generateId.js';

export const getInventory = asyncHandler(async (req, res) => {
  const items = await InventoryItem.find().sort({ createdAt: 1 });
  res.json(items);
});

export const createInventoryItem = asyncHandler(async (req, res) => {
  const itemId = await nextId(InventoryItem, 'itemId', 'MED');
  const item = new InventoryItem({ ...req.body, itemId });
  await item.save(); // triggers pre('save') status derivation
  res.status(201).json(item);
});

// Excludes itemId/_id/timestamps/status (status is always derived, never client-set).
const INVENTORY_EDITABLE_FIELDS = ['name', 'category', 'unit', 'quantity', 'reorderLevel', 'rate', 'supplier', 'expiry'];

export const updateInventoryItem = asyncHandler(async (req, res) => {
  const item = await InventoryItem.findOne({ itemId: req.params.id });
  if (!item) return res.status(404).json({ message: 'Item not found' });

  for (const field of INVENTORY_EDITABLE_FIELDS) {
    if (field in req.body) item[field] = req.body[field];
  }
  await item.save(); // triggers pre('save') status derivation
  res.json(item);
});

export const deleteInventoryItem = asyncHandler(async (req, res) => {
  const item = await InventoryItem.findOneAndDelete({ itemId: req.params.id });
  if (!item) return res.status(404).json({ message: 'Item not found' });
  res.status(204).end();
});
