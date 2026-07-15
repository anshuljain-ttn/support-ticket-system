import { Router } from 'express';

import {
  createTicket,
  getTicketById,
  listTickets,
  patchTicketStatus,
  searchTickets,
  updateTicket,
} from '@/controllers/ticket.controller.js';
import { validate } from '@/middleware/validate.middleware.js';
import {
  createTicketSchema,
  patchTicketStatusSchema,
  ticketIdParamSchema,
  ticketListQuerySchema,
  ticketSearchQuerySchema,
  updateTicketSchema,
} from '@/validators/ticket.validator.js';

const router = Router();

router.get('/tickets', validate(ticketListQuerySchema, 'query'), listTickets);
router.get('/tickets/search', validate(ticketSearchQuerySchema, 'query'), searchTickets);
router.get('/tickets/:id', validate(ticketIdParamSchema, 'params'), getTicketById);
router.post('/tickets', validate(createTicketSchema), createTicket);
router.put(
  '/tickets/:id',
  validate(ticketIdParamSchema, 'params'),
  validate(updateTicketSchema),
  updateTicket,
);
router.patch(
  '/tickets/:id/status',
  validate(ticketIdParamSchema, 'params'),
  validate(patchTicketStatusSchema),
  patchTicketStatus,
);

export default router;
