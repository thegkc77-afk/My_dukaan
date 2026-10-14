import { sendError } from '../utils/apiResponse.js';
import { ENV } from '../config/env.js';

export const notFoundHandler = (req, res) => {
  return sendError(
    res,
    'NOT_FOUND',
    `Cannot ${req.method} ${req.originalUrl}`,
    [],
    404
  );
};

export const globalErrorHandler = (err, req, res, next) => {
  console.error('[Error]', err);

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return sendError(res, 'INVALID_ID', `Invalid identifier format for ${err.path}`, [], 400);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const fields = Object.keys(err.keyValue || {});
    return sendError(
      res,
      'DUPLICATE_KEY',
      `Duplicate entry for field(s): ${fields.join(', ')}`,
      fields,
      409
    );
  }

  // Multer errors
  if (err.name === 'MulterError') {
    return sendError(res, 'UPLOAD_ERROR', err.message, [], 400);
  }

  // Fallback 500
  const message = ENV.NODE_ENV === 'production' ? 'An unexpected server error occurred' : err.message;
  return sendError(res, 'INTERNAL_SERVER_ERROR', message, [], 500);
};
