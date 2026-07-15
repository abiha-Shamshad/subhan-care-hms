import { Router } from 'express';
import { login, forgotPassword, verifyOtp, resetPassword, me, permissions } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);
router.get('/me', authenticate, me);
router.get('/permissions', authenticate, permissions);

export default router;
