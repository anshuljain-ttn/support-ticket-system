import { Types } from 'mongoose';
import { describe, expect, it } from 'vitest';

import { TicketPriorities, TicketStatuses } from '@/types/ticket.types.js';
import {
  objectIdParamSchema,
  objectIdSchema,
  paginationQuerySchema,
} from '@/validators/common.validator.js';
import {
  createTicketSchema,
  patchTicketStatusSchema,
  ticketListQuerySchema,
  ticketSearchQuerySchema,
  updateTicketSchema,
} from '@/validators/ticket.validator.js';

const validObjectId = new Types.ObjectId().toString();

describe('common validators', () => {
  it('validates ObjectId format', () => {
    expect(objectIdSchema.safeParse(validObjectId).success).toBe(true);
    expect(objectIdSchema.safeParse('invalid-id').success).toBe(false);
  });

  it('validates route id params', () => {
    const result = objectIdParamSchema.safeParse({ id: validObjectId });
    expect(result.success).toBe(true);
  });

  it('applies pagination defaults', () => {
    const result = paginationQuerySchema.parse({});
    expect(result).toEqual({ page: 1, limit: 20 });
  });

  it('caps pagination limit at 100', () => {
    const result = paginationQuerySchema.safeParse({ limit: 200 });
    expect(result.success).toBe(false);
  });
});

describe('ticket validators', () => {
  const validCreateBody = {
    title: 'VPN issue',
    description: 'Unable to connect to corporate VPN from home.',
    priority: TicketPriorities.HIGH,
  };

  it('validates create ticket body', () => {
    const result = createTicketSchema.safeParse(validCreateBody);
    expect(result.success).toBe(true);
  });

  it('rejects missing title on create', () => {
    const result = createTicketSchema.safeParse({
      ...validCreateBody,
      title: 'ab',
    });
    expect(result.success).toBe(false);
  });

  it('rejects unknown fields on create including status', () => {
    const result = createTicketSchema.safeParse({
      ...validCreateBody,
      status: TicketStatuses.RESOLVED,
    });
    expect(result.success).toBe(false);
  });

  it('validates update ticket body with optional fields', () => {
    const result = updateTicketSchema.safeParse({
      title: 'Updated title',
      priority: TicketPriorities.LOW,
    });
    expect(result.success).toBe(true);
  });

  it('rejects createdBy on update', () => {
    const result = updateTicketSchema.safeParse({
      createdBy: validObjectId,
    });
    expect(result.success).toBe(false);
  });

  it('validates status patch body', () => {
    const result = patchTicketStatusSchema.safeParse({
      status: TicketStatuses.IN_PROGRESS,
    });
    expect(result.success).toBe(true);
  });

  it('parses list query filters and defaults', () => {
    const result = ticketListQuerySchema.parse({
      status: TicketStatuses.OPEN,
      priority: [TicketPriorities.HIGH, TicketPriorities.CRITICAL],
      page: '2',
      limit: '10',
    });

    expect(result).toEqual({
      page: 2,
      limit: 10,
      status: [TicketStatuses.OPEN],
      priority: [TicketPriorities.HIGH, TicketPriorities.CRITICAL],
      sort: 'newest',
    });
  });

  it('parses search query with keyword', () => {
    const result = ticketSearchQuerySchema.parse({
      q: 'printer',
      sort: 'priority',
    });

    expect(result.q).toBe('printer');
    expect(result.sort).toBe('priority');
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
  });
});
