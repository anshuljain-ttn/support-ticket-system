import type { NextFunction, Request, Response } from 'express';
import type { ZodTypeAny } from 'zod';

import { ErrorCodes } from '@/constants/error-codes.js';
import { AppError } from '@/utils/app-error.js';

type ValidationTarget = 'body' | 'query' | 'params';

export function validate<Schema extends ZodTypeAny>(
  schema: Schema,
  target: ValidationTarget = 'body',
) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const details = result.error.errors.map((issue) => ({
        field: issue.path.join('.') || target,
        message: issue.message,
      }));

      next(
        new AppError(ErrorCodes.VALIDATION_ERROR, 'Validation failed', 400, details),
      );
      return;
    }

    const data: unknown = result.data;

    if (target === 'body') {
      // Express types `body` as `any`; data is validated by Zod at runtime.
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      req.body = data;
    } else if (target === 'query') {
      req.query = data as Request['query'];
    } else {
      req.params = data as Request['params'];
    }

    next();
  };
}
