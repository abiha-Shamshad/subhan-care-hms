import jwt from 'jsonwebtoken';
import { accessFor } from '../config/permissions.js';

export const authenticate = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Authentication required' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

/** 403s unless the caller's role has any access ('F'|'R'|'L') to moduleId. */
export const authorize = (moduleId) => (req, res, next) => {
  if (accessFor(req.user?.role, moduleId) === null) {
    return res.status(403).json({ message: 'You do not have access to this module' });
  }
  next();
};

/** 403s unless the caller's role has full ('F') access to moduleId — use to gate writes. */
export const requireFull = (moduleId) => (req, res, next) => {
  if (accessFor(req.user?.role, moduleId) !== 'F') {
    return res.status(403).json({ message: 'You do not have permission to modify this module' });
  }
  next();
};

/** 403s unless the caller's role is one of the given roles — for actions gated by
 * job function rather than a module's F/R/L access level (e.g. only pharmacists dispense). */
export const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({ message: 'You do not have permission to perform this action' });
  }
  next();
};
