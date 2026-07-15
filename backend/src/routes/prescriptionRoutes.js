import { Router } from 'express';
import { getPrescriptions, createPrescription, updatePrescription, dispensePrescription } from '../controllers/prescriptionController.js';
import { authenticate, authorize, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, authorize('prescriptions'));
router.get('/', getPrescriptions);
router.post('/', requireRole('doctor'), createPrescription);
router.put('/:id', requireRole('doctor'), updatePrescription);
router.patch('/:id/dispense', requireRole('pharmacist'), dispensePrescription);

export default router;
