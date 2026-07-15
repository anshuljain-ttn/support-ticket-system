import type { Request, Response } from 'express';

import { success } from '@/utils/api-response.js';

const SERVER_START_TIME = Date.now();

export function getHealth(_req: Request, res: Response): Response {
  return success(res, {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - SERVER_START_TIME) / 1000),
  });
}
