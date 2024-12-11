import { ErrorRequestHandler } from 'express';
import { config } from '../config/app-config';

export const handleErrors: ErrorRequestHandler = (err, _req, res) => {
  console.error('Unhandled error', { error: err.stack });
  res.status(500).json({
    error: 'Internal server error',
    message: config.NODE_ENV === 'development' ? err.message : undefined,
  });
};
