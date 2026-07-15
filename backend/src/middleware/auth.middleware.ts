import type { NextFunction, Request, Response } from 'express';

import { env } from '@/config/env.js';
import { ErrorCodes } from '@/constants/error-codes.js';
import { authService } from '@/services/auth.service.js';
import { AppError } from '@/utils/app-error.js';
import { verifyAccessToken } from '@/utils/jwt.js';

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = req.cookies?.[env.AUTH_COOKIE_NAME] as string | undefined;

    if (!token) {
      throw new AppError(ErrorCodes.UNAUTHORIZED, 'Authentication required', 401);
    }

    const payload = verifyAccessToken(token);
    req.user = await authService.getCurrentUser(payload.sub);
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }

    next(new AppError(ErrorCodes.UNAUTHORIZED, 'Authentication required', 401));
  }
}

export function optionalAuthenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const token = req.cookies?.[env.AUTH_COOKIE_NAME] as string | undefined;

  if (!token) {
    next();
    return;
  }

  void authenticate(req, _res, next);
}
