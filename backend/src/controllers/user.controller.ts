import type { NextFunction, Request, Response } from 'express';

import { userService } from '@/services/user.service.js';
import { success } from '@/utils/api-response.js';

export async function listUsers(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const users = await userService.getAllUsers();
    success(res, users);
  } catch (error) {
    next(error);
  }
}
