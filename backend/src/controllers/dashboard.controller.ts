import type { NextFunction, Request, Response } from 'express';

import { ticketService } from '@/services/ticket.service.js';
import { success } from '@/utils/api-response.js';

export async function getDashboardStats(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const stats = await ticketService.getDashboardStats(req.user!);
    success(res, stats);
  } catch (error) {
    next(error);
  }
}
