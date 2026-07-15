import { Router } from 'express';
import { getAppointments, createAppointment, updateAppointment } from '../controllers/appointmentController.js';
import { authenticate, authorize, requireFull } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, authorize('appointments'));
router.get('/', getAppointments);
router.post('/', requireFull('appointments'), createAppointment);
router.put('/:id', requireFull('appointments'), updateAppointment);

export default router;
