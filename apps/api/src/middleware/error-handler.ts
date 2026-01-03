import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/app-error.js';

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const appError = err instanceof AppError
    ? err
    : new AppError('Internal server error', 500, 'INTERNAL_ERROR');

  res.status(appError.statusCode).json({
    error: {
      code: appError.code,
      message: appError.message,
      details: appError.details ?? null,
    },
  });
};
