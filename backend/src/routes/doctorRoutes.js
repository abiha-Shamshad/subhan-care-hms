import { Router } from 'express';
import { getDoctors, getDoctor, createDoctor, updateDoctor } from '../controllers/doctorController.js';
import { authenticate, authorize, requireFull } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, authorize('doctors'));
router.get('/', getDoctors);
router.get('/:id', getDoctor);
router.post('/', requireFull('doctors'), createDoctor);
router.put('/:id', requireFull('doctors'), updateDoctor);

export default router;
