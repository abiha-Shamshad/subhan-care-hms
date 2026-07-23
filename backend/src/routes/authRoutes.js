import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  login, forgotPassword, verifyOtp, resetPassword, me, permissions,
  changePassword, permissionsMatrix,
} from '../controllers/authController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

const rateLimitResponse = (req, res) =>
  res.status(429).json({ message: 'Too many attempts. Please try again later.', requestId: req.id });

// 5 attempts/minute/IP — brute-force guard on the actual password check.
const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitResponse,
});

// 3 attempts/hour/IP — covers the whole reset flow (requesting an OTP, guessing
// it, and using the resulting token). verify-otp is the one an attacker would
// actually hammer to brute-force a 6-digit code, so it shares this tighter limit
// rather than the looser login one.
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 3,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitResponse,
});

// Same window, but keyed by the target email instead of the caller's IP, so
// rotating source IPs (cheap via proxies) can't be used to bypass the per-IP
// limiter above and hammer one victim's account from many addresses.
const emailKey = (req) => (req.body?.email || '').toLowerCase().trim() || req.ip;
const passwordResetEmailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 3,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: emailKey,
  handler: rateLimitResponse,
});

router.post('/login', loginLimiter, login);
router.post('/forgot-password', passwordResetLimiter, passwordResetEmailLimiter, forgotPassword);
router.post('/verify-otp', passwordResetLimiter, passwordResetEmailLimiter, verifyOtp);
router.post('/reset-password', passwordResetLimiter, passwordResetEmailLimiter, resetPassword);
router.get('/me', authenticate, me);
router.get('/permissions', authenticate, permissions);
router.patch('/change-password', authenticate, changePassword);
router.get('/permissions-matrix', authenticate, requireRole('admin'), permissionsMatrix);

export default router;
