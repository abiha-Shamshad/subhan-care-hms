export const notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}`, requestId: req.id });
};

export const errorHandler = (err, req, res, next) => {
  // ponytail: full stack can contain connection strings (MongoError) — only in dev.
  // Always tagged with req.id so a report of "requestId: <uuid>" can be matched
  // back to the detailed line in server-side logs without exposing it to the client.
  if (process.env.NODE_ENV !== 'production') {
    console.error(req.id, err);
  } else {
    console.error(req.id, err.name, err.message);
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: Object.values(err.errors).map((e) => e.message).join(', '), requestId: req.id });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    return res.status(409).json({ message: `${field} already exists`, requestId: req.id });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid id', requestId: req.id });
  }

  const status = err.status || 500;
  // ponytail: never echo raw err.message on 500 — could leak internals
  const safeMessage = status < 500 ? (err.message || 'Request error') : 'Internal server error';
  res.status(status).json({ message: safeMessage, requestId: req.id });
};
