import { z } from 'zod';

import { objectIdSchema } from '@/validators/common.validator.js';

export const createCommentSchema = z
  .object({
    message: z
      .string()
      .trim()
      .min(1, 'Message is required')
      .max(2000, 'Message must be at most 2000 characters'),
    createdBy: objectIdSchema,
  })
  .strict();

export type CreateCommentBody = z.infer<typeof createCommentSchema>;
