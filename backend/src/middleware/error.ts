import { Request, Response, NextFunction } from 'express';
import { sendError, AppError } from '../utils/response';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode);
    return;
  }

  console.error('Unhandled error:', err);
  sendError(res, 'Internal server error', 500);
};

export const notFound = (req: Request, res: Response): void => {
  sendError(res, `Route ${req.originalUrl} not found`, 404);
};
