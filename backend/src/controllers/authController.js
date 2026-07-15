import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { PERMISSIONS } from '../config/permissions.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const OTP_TTL_MS = 10 * 60 * 1000;
const RESET_TOKEN_TTL_MS = 15 * 60 * 1000;

const signToken = (user) =>
  jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const toPublicUser = (user) => ({ id: user._id, name: user.name, email: user.email, role: user.role });

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: (email || '').toLowerCase() });

  if (!user || !user.isActive || !(await bcrypt.compare(password || '', user.passwordHash))) {
    return res.status(401).json({ message: 'Invalid email or password. Please try again.' });
  }

  user.lastLogin = new Date();
  await user.save();

  res.json({ token: signToken(user), user: toPublicUser(user) });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: (email || '').toLowerCase() });

  if (user) {
    const otp = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
    user.resetOtpHash = await bcrypt.hash(otp, 10);
    user.resetOtpExpires = new Date(Date.now() + OTP_TTL_MS);
    await user.save();
    // No email provider configured — logged for local/dev testing.
    console.log(`[password reset] OTP for ${user.email}: ${otp}`);
  }

  // Always respond the same way so we don't leak which emails exist.
  res.json({ message: 'If that email is registered, an OTP has been sent.' });
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, code } = req.body;
  const user = await User.findOne({ email: (email || '').toLowerCase() });

  const valid =
    user?.resetOtpHash &&
    user.resetOtpExpires > new Date() &&
    (await bcrypt.compare(code || '', user.resetOtpHash));

  if (!valid) return res.status(400).json({ message: 'Invalid or expired code.' });

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetToken = resetToken;
  user.resetTokenExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
  user.resetOtpHash = null;
  user.resetOtpExpires = null;
  await user.save();

  res.json({ resetToken });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { email, password, token } = req.body;
  const user = await User.findOne({ email: (email || '').toLowerCase() });

  const valid = user?.resetToken && user.resetTokenExpires > new Date() && user.resetToken === token;
  if (!valid) return res.status(400).json({ message: 'Invalid or expired reset token.' });
  if (!password || password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });

  user.passwordHash = await bcrypt.hash(password, 10);
  user.resetToken = null;
  user.resetTokenExpires = null;
  await user.save();

  res.json({ message: 'Password has been reset.' });
});

export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ user: toPublicUser(user) });
});

export const permissions = asyncHandler(async (req, res) => {
  res.json({ role: req.user.role, permissions: PERMISSIONS[req.user.role] || {} });
});
