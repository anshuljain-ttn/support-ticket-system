import type { TicketDocument } from '@/models/ticket.model.js';
import type { PaginatedTickets, TicketRecord } from '@/types/ticket.types.js';

export function toTicketDto(ticket: TicketDocument): TicketRecord {
  return {
    _id: ticket._id.toString(),
    title: ticket.title,
    description: ticket.description,
    priority: ticket.priority,
    status: ticket.status,
    assignedTo: ticket.assignedTo ? ticket.assignedTo.toString() : null,
    createdBy: ticket.createdBy.toString(),
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
  };
}

export function toTicketDtoList(tickets: TicketDocument[]): TicketRecord[] {
  return tickets.map(toTicketDto);
}

export function toPaginatedTicketsDto(
  items: TicketDocument[],
  pagination: { page: number; limit: number; total: number; totalPages: number },
): PaginatedTickets {
  return {
    items: toTicketDtoList(items),
    pagination,
  };
}
