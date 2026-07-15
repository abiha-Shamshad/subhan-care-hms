import mongoose from 'mongoose';
import { deriveInventoryStatus } from '../utils/inventoryStatus.js';

const inventoryItemSchema = new mongoose.Schema(
  {
    itemId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    unit: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
    reorderLevel: { type: Number, required: true, min: 0 },
    rate: { type: Number, default: 0 },
    supplier: { type: String, default: '' },
    expiry: { type: String, default: '' },
    status: { type: String, enum: ['in-stock', 'low-stock', 'out-of-stock'], default: 'in-stock' },
  },
  { timestamps: true }
);

// Status is always derived from quantity/reorderLevel, mirroring Inventory.jsx's deriveStatus().
inventoryItemSchema.pre('save', function (next) {
  this.status = deriveInventoryStatus(this.quantity, this.reorderLevel);
  next();
});

export default mongoose.model('InventoryItem', inventoryItemSchema);
