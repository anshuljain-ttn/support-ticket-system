import type { Request, Response } from 'express';

import { ErrorCodes } from '@/constants/error-codes.js';
import { failure } from '@/utils/api-response.js';

export function notFoundHandler(req: Request, res: Response): Response {
  return failure(
    res,
    ErrorCodes.NOT_FOUND,
    `Route ${req.method} ${req.originalUrl} not found`,
    404,
  );
}
