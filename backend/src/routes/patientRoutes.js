import { Router } from 'express';
import { getPatients, getPatient, createPatient, updatePatient, deletePatient } from '../controllers/patientController.js';
import { authenticate, authorize, requireFull, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, authorize('patients'));
router.get('/', getPatients);
router.get('/:id', getPatient);
router.post('/', requireFull('patients'), createPatient);
router.put('/:id', requireFull('patients'), updatePatient);
// Deletion (anonymization) is a data-erasure action, so it's gated to admin
// regardless of which roles otherwise have full read/write on this module.
router.delete('/:id', requireRole('admin'), deletePatient);

export default router;
