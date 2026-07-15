import { z } from 'zod';

import { TicketPriorities, type TicketPriority } from '@/types/ticket.types';

const ticketPriorityValues = Object.values(TicketPriorities) as [
  TicketPriority,
  ...TicketPriority[],
];

export const createTicketFormSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(200),
  description: z
    .string()
    .trim()
    .min(10, 'Description must be at least 10 characters')
    .max(5000),
  priority: z.enum(ticketPriorityValues),
});

export const updateTicketFormSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(200),
  description: z
    .string()
    .trim()
    .min(10, 'Description must be at least 10 characters')
    .max(5000),
  priority: z.enum(ticketPriorityValues),
});

export type CreateTicketFormValues = z.input<typeof createTicketFormSchema>;
export type CreateTicketFormOutput = z.output<typeof createTicketFormSchema>;
export type UpdateTicketFormValues = z.infer<typeof updateTicketFormSchema>;
