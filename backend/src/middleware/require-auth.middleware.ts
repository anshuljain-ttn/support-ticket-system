import type { NextFunction, Request, Response } from 'express';

import { ErrorCodes } from '@/constants/error-codes.js';
import { AppError } from '@/utils/app-error.js';

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    next(new AppError(ErrorCodes.UNAUTHORIZED, 'Authentication required', 401));
    return;
  }

  next();
}
