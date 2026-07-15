import { Router } from 'express';
import { getHistoryForPatient, addHistoryEntry } from '../controllers/medicalHistoryController.js';
import { authenticate, authorize, requireRole } from '../middleware/auth.js';

const router = Router();

// No PUT/DELETE routes exist for this resource — entries are append-only, enforced
// here at the routing layer (and again at the schema level, see MedicalHistoryEntry.js).
router.use(authenticate, authorize('medical-history'));
router.get('/:patientId', getHistoryForPatient);
router.post('/:patientId', requireRole('doctor'), addHistoryEntry);

export default router;
