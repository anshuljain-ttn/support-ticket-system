import { z } from 'zod';

export const createCommentSchema = z
  .object({
    message: z
      .string()
      .trim()
      .min(1, 'Message is required')
      .max(2000, 'Message must be at most 2000 characters'),
  })
  .strict();

export type CreateCommentBody = z.infer<typeof createCommentSchema>;
