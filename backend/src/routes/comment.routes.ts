import { Router } from 'express';

import { addComment } from '@/controllers/comment.controller.js';
import { validate } from '@/middleware/validate.middleware.js';
import { createCommentSchema } from '@/validators/comment.validator.js';
import { ticketIdParamSchema } from '@/validators/ticket.validator.js';

const router = Router();

router.post(
  '/tickets/:id/comments',
  validate(ticketIdParamSchema, 'params'),
  validate(createCommentSchema),
  addComment,
);

export default router;
