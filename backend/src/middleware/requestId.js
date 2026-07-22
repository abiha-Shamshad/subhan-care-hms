import { randomUUID } from 'node:crypto';

// Lets us return a correlation ID to the client on error responses instead of
// any internal detail — support/logs can look up the matching server-side
// log line by this ID without the client ever seeing a stack trace.
export const requestId = (req, res, next) => {
  req.id = randomUUID();
  res.setHeader('X-Request-Id', req.id);
  next();
};
