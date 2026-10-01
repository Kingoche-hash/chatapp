import { env } from '../config/env.js';

export const notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

// Express recognizes error handlers by their 4 arguments, so keep `next`.
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;

  if (status >= 500) console.error(err);

  res.status(status).json({
    message: status >= 500 && env.nodeEnv === 'production' ? 'Internal server error' : err.message,
  });
};