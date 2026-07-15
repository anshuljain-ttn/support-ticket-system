import { describe, expect, it } from 'vitest';

import { ALLOWED_TRANSITIONS } from '@/constants/status-transitions.js';
import { TicketStatuses } from '@/types/ticket.types.js';

describe('status transitions constants', () => {
  it('defines allowed transitions per spec state machine', () => {
    expect(ALLOWED_TRANSITIONS[TicketStatuses.OPEN]).toEqual([
      TicketStatuses.IN_PROGRESS,
      TicketStatuses.CANCELLED,
    ]);
    expect(ALLOWED_TRANSITIONS[TicketStatuses.IN_PROGRESS]).toEqual([
      TicketStatuses.RESOLVED,
      TicketStatuses.CANCELLED,
    ]);
    expect(ALLOWED_TRANSITIONS[TicketStatuses.RESOLVED]).toEqual([TicketStatuses.CLOSED]);
    expect(ALLOWED_TRANSITIONS[TicketStatuses.CLOSED]).toEqual([]);
    expect(ALLOWED_TRANSITIONS[TicketStatuses.CANCELLED]).toEqual([]);
  });
});
