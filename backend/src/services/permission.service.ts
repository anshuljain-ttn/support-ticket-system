import { Types, type FilterQuery } from 'mongoose';

import { Roles } from '@/constants/roles.js';
import { ErrorCodes } from '@/constants/error-codes.js';
import type { TicketDocument } from '@/models/ticket.model.js';
import { getAllowedTransitions } from '@/services/status-machine.service.js';
import { TicketStatuses, type TicketStatus } from '@/types/ticket.types.js';
import type { UserRecord } from '@/types/user.types.js';
import { AppError } from '@/utils/app-error.js';
import { isTicketOwner } from '@/utils/ownership.js';

function isSuperAdmin(user: UserRecord): boolean {
  return user.role === Roles.SUPER_ADMIN;
}

function isAdmin(user: UserRecord): boolean {
  return user.role === Roles.ADMIN;
}

function isEmployee(user: UserRecord): boolean {
  return user.role === Roles.EMPLOYEE;
}

export const permissionService = {
  isSuperAdmin,
  isAdmin,
  isEmployee,
  isTicketOwner,

  canViewTicket(user: UserRecord, ticket: TicketDocument): boolean {
    if (isSuperAdmin(user)) {
      return true;
    }

    if (isTicketOwner(ticket, user._id)) {
      return true;
    }

    if (isEmployee(user)) {
      return false;
    }

    if (isAdmin(user)) {
      if (ticket.assignedTo?.toString() === user._id) {
        return true;
      }

      return !isTicketOwner(ticket, user._id);
    }

    return false;
  },

  getTicketListFilter(user: UserRecord): FilterQuery<TicketDocument> {
    if (isSuperAdmin(user)) {
      return {};
    }

    if (isEmployee(user)) {
      return { createdBy: new Types.ObjectId(user._id) };
    }

    return {
      $or: [
        { createdBy: new Types.ObjectId(user._id) },
        { assignedTo: new Types.ObjectId(user._id) },
        {
          createdBy: { $ne: new Types.ObjectId(user._id) },
          status: {
            $in: [TicketStatuses.OPEN, TicketStatuses.IN_PROGRESS, TicketStatuses.RESOLVED],
          },
        },
      ],
    };
  },

  canCreateTicket(user: UserRecord): boolean {
    return user.isActive;
  },

  canUpdateTicket(user: UserRecord, ticket: TicketDocument): boolean {
    if (isSuperAdmin(user)) {
      return true;
    }

    if (isTicketOwner(ticket, user._id)) {
      return ticket.status === TicketStatuses.OPEN;
    }

    if (isAdmin(user)) {
      return !isTicketOwner(ticket, user._id);
    }

    return false;
  },

  canAssignTicket(user: UserRecord, ticket: TicketDocument): boolean {
    if (isSuperAdmin(user)) {
      return true;
    }

    if (isTicketOwner(ticket, user._id)) {
      return false;
    }

    return isAdmin(user);
  },

  canChangeStatus(user: UserRecord, ticket: TicketDocument, newStatus: TicketStatus): boolean {
    if (isSuperAdmin(user)) {
      return true;
    }

    if (isTicketOwner(ticket, user._id)) {
      return (
        ticket.status === TicketStatuses.OPEN && newStatus === TicketStatuses.CANCELLED
      );
    }

    if (isAdmin(user)) {
      return !isTicketOwner(ticket, user._id);
    }

    return false;
  },

  getAllowedTransitionsForUser(user: UserRecord, ticket: TicketDocument): TicketStatus[] {
    const workflowTransitions = getAllowedTransitions(ticket.status);

    if (isSuperAdmin(user)) {
      return workflowTransitions;
    }

    if (isTicketOwner(ticket, user._id)) {
      if (ticket.status === TicketStatuses.OPEN) {
        return workflowTransitions.filter((status) => status === TicketStatuses.CANCELLED);
      }

      return [];
    }

    if (isAdmin(user) && !isTicketOwner(ticket, user._id)) {
      return workflowTransitions;
    }

    return [];
  },

  canCommentOnTicket(user: UserRecord, ticket: TicketDocument): boolean {
    return this.canViewTicket(user, ticket);
  },

  assertCanViewTicket(user: UserRecord, ticket: TicketDocument): void {
    if (!this.canViewTicket(user, ticket)) {
      throw new AppError(ErrorCodes.FORBIDDEN, 'You do not have permission to view this ticket', 403);
    }
  },

  assertCanCreateTicket(user: UserRecord): void {
    if (!this.canCreateTicket(user)) {
      throw new AppError(ErrorCodes.FORBIDDEN, 'You do not have permission to create tickets', 403);
    }
  },

  assertCanUpdateTicket(user: UserRecord, ticket: TicketDocument): void {
    if (!this.canUpdateTicket(user, ticket)) {
      throw new AppError(ErrorCodes.FORBIDDEN, 'You do not have permission to update this ticket', 403);
    }
  },

  assertCanAssignTicket(user: UserRecord, ticket: TicketDocument): void {
    if (!this.canAssignTicket(user, ticket)) {
      throw new AppError(ErrorCodes.FORBIDDEN, 'You do not have permission to assign this ticket', 403);
    }
  },

  assertCanChangeStatus(
    user: UserRecord,
    ticket: TicketDocument,
    newStatus: TicketStatus,
  ): void {
    if (!this.canChangeStatus(user, ticket, newStatus)) {
      throw new AppError(
        ErrorCodes.FORBIDDEN,
        'You do not have permission to change the ticket status',
        403,
      );
    }
  },

  assertCanCommentOnTicket(user: UserRecord, ticket: TicketDocument): void {
    if (!this.canCommentOnTicket(user, ticket)) {
      throw new AppError(ErrorCodes.FORBIDDEN, 'You do not have permission to comment on this ticket', 403);
    }
  },
};
