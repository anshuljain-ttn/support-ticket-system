import type { ApiErrorDetail } from '@/types/api-response.types.js';

export class AppError extends Error {
  readonly code: string;
  readonly statusCode: number;
  readonly details?: ApiErrorDetail[];

  constructor(code: string, message: string, statusCode: number, details?: ApiErrorDetail[]) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}
