import type { TicketStatus } from '@/types/ticket.types.js';
import { TicketStatuses } from '@/types/ticket.types.js';

export const ALLOWED_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  [TicketStatuses.OPEN]: [TicketStatuses.IN_PROGRESS, TicketStatuses.CANCELLED],
  [TicketStatuses.IN_PROGRESS]: [TicketStatuses.RESOLVED, TicketStatuses.CANCELLED],
  [TicketStatuses.RESOLVED]: [TicketStatuses.CLOSED],
  [TicketStatuses.CLOSED]: [],
  [TicketStatuses.CANCELLED]: [],
};

export const ALL_TICKET_STATUSES = Object.values(TicketStatuses);
