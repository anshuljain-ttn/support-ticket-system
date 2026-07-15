import type { NextFunction, Request, Response } from 'express';

import { authService } from '@/services/auth.service.js';
import type { LoginBody } from '@/validators/auth.validator.js';
import { success } from '@/utils/api-response.js';

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await authService.login(req.body as LoginBody);

    res.cookie(authService.getCookieName(), result.token, authService.getCookieOptions());
    success(res, { user: result.user });
  } catch (error) {
    next(error);
  }
}

export async function logout(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.clearCookie(authService.getCookieName(), authService.getClearCookieOptions());
    success(res, { message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
}

export async function getCurrentUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    success(res, req.user);
  } catch (error) {
    next(error);
  }
}
