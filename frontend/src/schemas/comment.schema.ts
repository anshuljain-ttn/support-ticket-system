import { z } from 'zod';

export const createCommentFormSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, 'Message is required')
    .max(2000, 'Message must be at most 2000 characters'),
});

export type CreateCommentFormValues = z.infer<typeof createCommentFormSchema>;
