import { ALLOWED_TRANSITIONS } from '@/constants/status-transitions.js';
import { ErrorCodes } from '@/constants/error-codes.js';
import type { TicketStatus } from '@/types/ticket.types.js';
import { AppError } from '@/utils/app-error.js';

export function canTransition(from: TicketStatus, to: TicketStatus): boolean {
  if (from === to) {
    return true;
  }

  return ALLOWED_TRANSITIONS[from].includes(to);
}

export function validateTransition(from: TicketStatus, to: TicketStatus): void {
  if (canTransition(from, to)) {
    return;
  }

  throw new AppError(
    ErrorCodes.INVALID_STATUS_TRANSITION,
    `Invalid status transition from '${from}' to '${to}'`,
    400,
    [{ field: 'status', message: `Cannot transition from '${from}' to '${to}'` }],
  );
}

export function getAllowedTransitions(from: TicketStatus): TicketStatus[] {
  return [...ALLOWED_TRANSITIONS[from]];
}

export const statusMachineService = {
  canTransition,
  validateTransition,
  getAllowedTransitions,
};
