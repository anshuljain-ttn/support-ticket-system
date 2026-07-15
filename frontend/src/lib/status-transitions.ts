import type { TicketStatus } from '@/types/ticket.types';
import { TicketStatuses } from '@/types/ticket.types';

export const ALLOWED_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  [TicketStatuses.OPEN]: [TicketStatuses.IN_PROGRESS, TicketStatuses.CANCELLED],
  [TicketStatuses.IN_PROGRESS]: [TicketStatuses.RESOLVED, TicketStatuses.CANCELLED],
  [TicketStatuses.RESOLVED]: [TicketStatuses.CLOSED],
  [TicketStatuses.CLOSED]: [],
  [TicketStatuses.CANCELLED]: [],
};

export const ALL_TICKET_STATUSES = Object.values(TicketStatuses);

export function canTransition(from: TicketStatus, to: TicketStatus): boolean {
  if (from === to) {
    return true;
  }

  return ALLOWED_TRANSITIONS[from].includes(to);
}

export function getAllowedTransitions(from: TicketStatus): TicketStatus[] {
  return [...ALLOWED_TRANSITIONS[from]];
}
