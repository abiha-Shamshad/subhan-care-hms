import { Router } from 'express';
import { getInvoices, createInvoice, recordPayment, draftInvoiceFromAppointment } from '../controllers/invoiceController.js';
import { authenticate, authorize, requireFull } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, authorize('billing'));
router.get('/', getInvoices);
router.post('/', requireFull('billing'), createInvoice);
router.post('/from-appointment/:appointmentId', requireFull('billing'), draftInvoiceFromAppointment);
router.patch('/:id/payment', requireFull('billing'), recordPayment);

export default router;
