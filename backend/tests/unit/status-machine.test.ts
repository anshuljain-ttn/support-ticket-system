import { describe, expect, it } from 'vitest';

import { ErrorCodes } from '@/constants/error-codes.js';
import {
  canTransition,
  getAllowedTransitions,
  validateTransition,
} from '@/services/status-machine.service.js';
import { TicketStatuses } from '@/types/ticket.types.js';
import { AppError } from '@/utils/app-error.js';

describe('statusMachineService', () => {
  describe('getAllowedTransitions', () => {
    it("returns allowed transitions for Open", () => {
      expect(getAllowedTransitions(TicketStatuses.OPEN)).toEqual([
        TicketStatuses.IN_PROGRESS,
        TicketStatuses.CANCELLED,
      ]);
    });
  });

  describe('valid transitions', () => {
    const validTransitions = [
      { from: TicketStatuses.OPEN, to: TicketStatuses.IN_PROGRESS },
      { from: TicketStatuses.OPEN, to: TicketStatuses.CANCELLED },
      { from: TicketStatuses.IN_PROGRESS, to: TicketStatuses.RESOLVED },
      { from: TicketStatuses.IN_PROGRESS, to: TicketStatuses.CANCELLED },
      { from: TicketStatuses.RESOLVED, to: TicketStatuses.CLOSED },
    ] as const;

    it.each(validTransitions)('allows $from -> $to', ({ from, to }) => {
      expect(canTransition(from, to)).toBe(true);
      expect(() => validateTransition(from, to)).not.toThrow();
    });
  });

  describe('invalid transitions', () => {
    const invalidTransitions = [
      { from: TicketStatuses.OPEN, to: TicketStatuses.RESOLVED },
      { from: TicketStatuses.OPEN, to: TicketStatuses.CLOSED },
      { from: TicketStatuses.IN_PROGRESS, to: TicketStatuses.OPEN },
      { from: TicketStatuses.RESOLVED, to: TicketStatuses.IN_PROGRESS },
      { from: TicketStatuses.RESOLVED, to: TicketStatuses.CANCELLED },
      { from: TicketStatuses.CLOSED, to: TicketStatuses.OPEN },
      { from: TicketStatuses.CLOSED, to: TicketStatuses.CANCELLED },
      { from: TicketStatuses.CANCELLED, to: TicketStatuses.OPEN },
    ] as const;

    it.each(invalidTransitions)('rejects $from -> $to', ({ from, to }) => {
      expect(canTransition(from, to)).toBe(false);
      expect(() => validateTransition(from, to)).toThrow(AppError);
    });

    it('throws INVALID_STATUS_TRANSITION for invalid transitions', () => {
      try {
        validateTransition(TicketStatuses.OPEN, TicketStatuses.RESOLVED);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).code).toBe(ErrorCodes.INVALID_STATUS_TRANSITION);
        expect((error as AppError).statusCode).toBe(400);
      }
    });
  });

  describe('idempotent transitions', () => {
    const statuses = Object.values(TicketStatuses);

    it.each(statuses)('allows same-status transition for %s', (status) => {
      expect(canTransition(status, status)).toBe(true);
      expect(() => validateTransition(status, status)).not.toThrow();
    });
  });
});
