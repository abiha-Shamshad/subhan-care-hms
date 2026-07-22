export const notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

export const errorHandler = (err, req, res, next) => {
  // ponytail: full stack can contain connection strings (MongoError) — only in dev
  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  } else {
    console.error(err.name, err.message);
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: Object.values(err.errors).map((e) => e.message).join(', ') });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    return res.status(409).json({ message: `${field} already exists` });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ message: `Invalid id: ${err.value}` });
  }

  const status = err.status || 500;
  // ponytail: never echo raw err.message on 500 — could leak internals
  const safeMessage = status < 500 ? (err.message || 'Request error') : 'Internal server error';
  res.status(status).json({ message: safeMessage });
};
