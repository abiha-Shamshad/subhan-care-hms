import { Router } from 'express';
import { getRevenueReport, getInventoryUsageReport, getPrescriptionTrendsReport, getAppointmentLoadReport } from '../controllers/reportsController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, authorize('reports'));
router.get('/revenue', getRevenueReport);
router.get('/inventory-usage', getInventoryUsageReport);
router.get('/prescription-trends', getPrescriptionTrendsReport);
router.get('/appointment-load', getAppointmentLoadReport);

export default router;
