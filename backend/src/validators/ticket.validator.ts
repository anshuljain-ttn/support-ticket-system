import { z } from 'zod';

import { ALL_TICKET_STATUSES } from '@/constants/status-transitions.js';
import {
  TicketPriorities,
  type TicketPriority,
  type TicketSortOption,
  type TicketStatus,
} from '@/types/ticket.types.js';

import {
  objectIdParamSchema,
  objectIdSchema,
  paginationQuerySchema,
  stringArrayQuerySchema,
} from '@/validators/common.validator.js';

const ticketStatusSchema = z.enum(ALL_TICKET_STATUSES as [TicketStatus, ...TicketStatus[]]);

const ticketPrioritySchema = z.enum(
  Object.values(TicketPriorities) as [TicketPriority, ...TicketPriority[]],
);

const sortSchema = z.enum(['newest', 'oldest', 'priority'] satisfies [
  TicketSortOption,
  ...TicketSortOption[],
]);

export const createTicketSchema = z
  .object({
    title: z.string().trim().min(3, 'Title must be at least 3 characters').max(200),
    description: z
      .string()
      .trim()
      .min(10, 'Description must be at least 10 characters')
      .max(5000),
    priority: ticketPrioritySchema,
  })
  .strict();

export const updateTicketSchema = z
  .object({
    title: z.string().trim().min(3).max(200).optional(),
    description: z.string().trim().min(10).max(5000).optional(),
    priority: ticketPrioritySchema.optional(),
  })
  .strict();

export const patchTicketStatusSchema = z.object({
  status: ticketStatusSchema,
});

export const patchTicketAssignSchema = z.object({
  assignedTo: objectIdSchema.nullable(),
});

export const ticketIdParamSchema = objectIdParamSchema;

const ticketQueryBaseSchema = paginationQuerySchema.extend({
  status: stringArrayQuerySchema.pipe(z.array(ticketStatusSchema).optional()),
  priority: stringArrayQuerySchema.pipe(z.array(ticketPrioritySchema).optional()),
  assignedTo: objectIdSchema.optional(),
  createdBy: objectIdSchema.optional(),
  sort: sortSchema.optional().default('newest'),
});

export const ticketListQuerySchema = ticketQueryBaseSchema;

export const ticketSearchQuerySchema = ticketQueryBaseSchema.extend({
  q: z.string().trim().max(256).optional(),
});

export type CreateTicketBody = z.infer<typeof createTicketSchema>;
export type UpdateTicketBody = z.infer<typeof updateTicketSchema>;
export type PatchTicketStatusBody = z.infer<typeof patchTicketStatusSchema>;
export type PatchTicketAssignBody = z.infer<typeof patchTicketAssignSchema>;
export type TicketListQuery = z.infer<typeof ticketListQuerySchema>;
export type TicketSearchQuery = z.infer<typeof ticketSearchQuerySchema>;
