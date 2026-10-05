import { env } from '../config/env.js';

export const notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

// Express recognizes error handlers by their 4 arguments, so keep `next`.
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message;

  if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyPattern || {})[0] || 'value';
    message = `${field} already in use`;
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Invalid or expired token';
  }

  if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Invalid JSON body';
  }

  // Problems with uploaded files (too big, too many, wrong field).
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      status = 413;
      message = 'A file is too large (maximum 10 MB each)';
    } else if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
      status = 400;
      message = 'Too many files (maximum 5), or the files were not sent in the "files" field';
    } else {
      status = 400;
      message = 'Invalid upload';
    }
  }

  if (status >= 500) console.error(err);

  res.status(status).json({
    message: status >= 500 && env.nodeEnv === 'production' ? 'Internal server error' : message,
  });
};