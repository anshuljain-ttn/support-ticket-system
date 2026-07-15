import { Types } from 'mongoose';
import { describe, expect, it } from 'vitest';

import { toPaginatedTicketsDto, toTicketDto } from '@/dto/ticket.dto.js';
import { TicketPriorities, TicketStatuses } from '@/types/ticket.types.js';

describe('ticket DTOs', () => {
  it('maps ticket document to API record', () => {
    const now = new Date('2026-07-15T10:00:00.000Z');
    const userId = new Types.ObjectId();
    const ticketId = new Types.ObjectId();

    const dto = toTicketDto({
      _id: ticketId,
      title: 'Printer issue',
      description: 'Office printer is not responding to jobs.',
      priority: TicketPriorities.MEDIUM,
      status: TicketStatuses.OPEN,
      assignedTo: null,
      createdBy: userId,
      lastUpdatedBy: userId,
      createdAt: now,
      updatedAt: now,
    } as never);

    expect(dto).toEqual({
      _id: ticketId.toString(),
      title: 'Printer issue',
      description: 'Office printer is not responding to jobs.',
      priority: TicketPriorities.MEDIUM,
      status: TicketStatuses.OPEN,
      assignedTo: null,
      createdBy: userId.toString(),
      lastUpdatedBy: userId.toString(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
  });

  it('maps paginated ticket results', () => {
    const now = new Date('2026-07-15T10:00:00.000Z');
    const userId = new Types.ObjectId();
    const ticketId = new Types.ObjectId();

    const result = toPaginatedTicketsDto(
      [
        {
          _id: ticketId,
          title: 'Email outage',
          description: 'Users cannot send external emails.',
          priority: TicketPriorities.CRITICAL,
          status: TicketStatuses.IN_PROGRESS,
          assignedTo: userId,
          createdBy: userId,
          lastUpdatedBy: userId,
          createdAt: now,
          updatedAt: now,
        } as never,
      ],
      { page: 1, limit: 20, total: 1, totalPages: 1 },
    );

    expect(result.items).toHaveLength(1);
    expect(result.pagination.total).toBe(1);
    expect(result.items[0]?.assignedTo).toBe(userId.toString());
  });
});
