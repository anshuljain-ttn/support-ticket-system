import type { NextFunction, Request, Response } from 'express';

import { ErrorCodes } from '@/constants/error-codes.js';
import { failure } from '@/utils/api-response.js';
import { AppError } from '@/utils/app-error.js';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof AppError) {
    console.error(`[error] ${err.code}: ${err.message}`, {
      method: req.method,
      path: req.originalUrl,
      details: err.details,
    });

    failure(res, err.code, err.message, err.statusCode, err.details);
    return;
  }

  if (err instanceof SyntaxError && 'body' in err) {
    failure(res, ErrorCodes.VALIDATION_ERROR, 'Invalid JSON body', 400);
    return;
  }

  console.error('[error] Unhandled error', {
    method: req.method,
    path: req.originalUrl,
    err,
  });

  failure(res, ErrorCodes.INTERNAL_ERROR, 'Internal server error', 500);
}
