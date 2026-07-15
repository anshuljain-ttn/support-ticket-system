import { z } from 'zod';

import { isValidObjectId } from '@/utils/object-id.js';

export const objectIdSchema = z
  .string()
  .refine(isValidObjectId, { message: 'Invalid ObjectId format' });

export const objectIdParamSchema = z.object({
  id: objectIdSchema,
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

function toStringArray(value: unknown): string[] | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value.filter((item): item is string | number => {
      return typeof item === 'string' || typeof item === 'number';
    }).map(String);
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return [String(value)];
  }

  return undefined;
}

export const stringArrayQuerySchema = z.preprocess(toStringArray, z.array(z.string()).optional());

export { toStringArray };
