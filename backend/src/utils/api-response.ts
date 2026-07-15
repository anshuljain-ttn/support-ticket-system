import type { Response } from 'express';

import type { ApiError, ApiErrorDetail } from '@/types/api-response.types.js';

export function success<T>(res: Response, data: T, statusCode = 200): Response {
  return res.status(statusCode).json({ success: true, data });
}

export function failure(
  res: Response,
  code: string,
  message: string,
  statusCode = 400,
  details?: ApiErrorDetail[],
): Response {
  const error: ApiError = { code, message };

  if (details && details.length > 0) {
    error.details = details;
  }

  return res.status(statusCode).json({ success: false, error });
}
