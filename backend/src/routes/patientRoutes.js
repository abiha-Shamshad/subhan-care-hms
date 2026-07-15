import { Router } from 'express';
import { getPatients, getPatient, createPatient, updatePatient } from '../controllers/patientController.js';
import { authenticate, authorize, requireFull } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, authorize('patients'));
router.get('/', getPatients);
router.get('/:id', getPatient);
router.post('/', requireFull('patients'), createPatient);
router.put('/:id', requireFull('patients'), updatePatient);

export default router;
