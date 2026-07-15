import { Router } from 'express';

import {
  createTicket,
  getTicketById,
  listTickets,
  patchTicketAssign,
  patchTicketStatus,
  searchTickets,
  updateTicket,
} from '@/controllers/ticket.controller.js';
import { addComment } from '@/controllers/comment.controller.js';
import { authenticate } from '@/middleware/auth.middleware.js';
import { requireAuth } from '@/middleware/require-auth.middleware.js';
import { validate } from '@/middleware/validate.middleware.js';
import { createCommentSchema } from '@/validators/comment.validator.js';
import {
  createTicketSchema,
  patchTicketAssignSchema,
  patchTicketStatusSchema,
  ticketIdParamSchema,
  ticketListQuerySchema,
  ticketSearchQuerySchema,
  updateTicketSchema,
} from '@/validators/ticket.validator.js';

const router = Router();

router.use(authenticate, requireAuth);

router.get('/', validate(ticketListQuerySchema, 'query'), listTickets);
router.get('/search', validate(ticketSearchQuerySchema, 'query'), searchTickets);
router.get('/:id', validate(ticketIdParamSchema, 'params'), getTicketById);
router.post('/', validate(createTicketSchema), createTicket);
router.put(
  '/:id',
  validate(ticketIdParamSchema, 'params'),
  validate(updateTicketSchema),
  updateTicket,
);
router.patch(
  '/:id/status',
  validate(ticketIdParamSchema, 'params'),
  validate(patchTicketStatusSchema),
  patchTicketStatus,
);
router.patch(
  '/:id/assign',
  validate(ticketIdParamSchema, 'params'),
  validate(patchTicketAssignSchema),
  patchTicketAssign,
);
router.post(
  '/:id/comments',
  validate(ticketIdParamSchema, 'params'),
  validate(createCommentSchema),
  addComment,
);

export default router;
