import { Router } from 'express';
import { getInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem } from '../controllers/inventoryController.js';
import { authenticate, authorize, requireFull } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, authorize('inventory'));
router.get('/', getInventory);
router.post('/', requireFull('inventory'), createInventoryItem);
router.put('/:id', requireFull('inventory'), updateInventoryItem);
router.delete('/:id', requireFull('inventory'), deleteInventoryItem);

export default router;
