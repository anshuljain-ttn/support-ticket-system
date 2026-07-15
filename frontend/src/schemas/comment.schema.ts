import { z } from 'zod';

import { objectIdSchema } from '@/schemas/ticket.schema';

export const createCommentFormSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, 'Message is required')
    .max(2000, 'Message must be at most 2000 characters'),
  createdBy: objectIdSchema,
});

export type CreateCommentFormValues = z.infer<typeof createCommentFormSchema>;
