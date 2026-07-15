import { HistoryActions } from '@/constants/permissions.js';
import { Roles } from '@/constants/roles.js';
import { ALL_TICKET_STATUSES } from '@/constants/status-transitions.js';
import { ErrorCodes } from '@/constants/error-codes.js';
import { toCommentDtoList } from '@/dto/comment.dto.js';
import { toPaginatedTicketsDto, toTicketDto } from '@/dto/ticket.dto.js';
import type { TicketDocument } from '@/models/ticket.model.js';
import { commentRepository } from '@/repositories/comment.repository.js';
import { ticketRepository } from '@/repositories/ticket.repository.js';
import { userRepository } from '@/repositories/user.repository.js';
import { auditService } from '@/services/audit.service.js';
import { permissionService } from '@/services/permission.service.js';
import { validateTransition } from '@/services/status-machine.service.js';
import { userService } from '@/services/user.service.js';
import type {
  DashboardStats,
  PaginatedTickets,
  TicketDetail,
  TicketPermissions,
  TicketStats,
  TicketStatus,
} from '@/types/ticket.types.js';
import { TicketStatuses } from '@/types/ticket.types.js';
import type { UserRecord } from '@/types/user.types.js';
import type {
  CreateTicketBody,
  PatchTicketAssignBody,
  TicketListQuery,
  TicketSearchQuery,
  UpdateTicketBody,
} from '@/validators/ticket.validator.js';
import { AppError } from '@/utils/app-error.js';
import { isValidObjectId } from '@/utils/object-id.js';

function mapListQuery(query: TicketListQuery, user: UserRecord) {
  return {
    status: query.status,
    priority: query.priority,
    assignedTo: query.assignedTo,
    createdBy: query.createdBy,
    sort: query.sort,
    page: query.page,
    limit: query.limit,
    scopeFilter: permissionService.getTicketListFilter(user),
  };
}

function buildPermissions(user: UserRecord, ticket: TicketDocument): TicketPermissions {
  return {
    canEdit: permissionService.canUpdateTicket(user, ticket),
    canAssign: permissionService.canAssignTicket(user, ticket),
    canChangeStatus: permissionService.getAllowedTransitionsForUser(user, ticket).length > 0,
    canComment: permissionService.canCommentOnTicket(user, ticket),
  };
}

async function resolveSearchTicketIds(
  search: string,
  scopeFilter: Record<string, unknown>,
): Promise<string[]> {
  const [ticketIds, commentTicketIds] = await Promise.all([
    ticketRepository.findIdsByTextSearch(search, scopeFilter),
    commentRepository.findTicketIdsByMessageSearch(search),
  ]);

  const scopedTicketIds = new Set(ticketIds);

  if (commentTicketIds.length > 0) {
    const commentScoped = await ticketRepository.findWithQuery({
      scopeFilter: {
        ...scopeFilter,
        ticketIds: commentTicketIds,
      },
      page: 1,
      limit: commentTicketIds.length,
    });

    for (const ticket of commentScoped.items) {
      scopedTicketIds.add(ticket._id.toString());
    }
  }

  return [...scopedTicketIds];
}

export const ticketService = {
  async createTicket(user: UserRecord, input: CreateTicketBody) {
    permissionService.assertCanCreateTicket(user);

    const historyEntry = auditService.buildCreatedEntry(user._id);

    const ticket = await ticketRepository.create(
      {
        title: input.title,
        description: input.description,
        priority: input.priority,
        createdBy: user._id,
        lastUpdatedBy: user._id,
        status: TicketStatuses.OPEN,
      },
      {
        action: historyEntry.action,
        performedBy: user._id,
        performedAt: new Date(),
        previousValue: historyEntry.previousValue,
        newValue: historyEntry.newValue,
        comment: historyEntry.comment,
      },
    );

    return toTicketDto(ticket);
  },

  async getTicketById(user: UserRecord, id: string): Promise<TicketDetail> {
    const ticket = await this.getTicketDocumentOrThrow(id);
    permissionService.assertCanViewTicket(user, ticket);

    const comments = await commentRepository.findByTicketId(id);

    return {
      ticket: toTicketDto(ticket),
      comments: toCommentDtoList(comments),
      history: auditService.toHistoryDtoList(ticket),
      allowedTransitions: permissionService.getAllowedTransitionsForUser(user, ticket),
      permissions: buildPermissions(user, ticket),
    };
  },

  async updateTicket(user: UserRecord, id: string, input: UpdateTicketBody) {
    const ticket = await this.getTicketDocumentOrThrow(id);
    permissionService.assertCanUpdateTicket(user, ticket);

    if (input.title !== undefined && input.title !== ticket.title) {
      await auditService.appendHistory(
        id,
        auditService.buildFieldChangeEntry(
          HistoryActions.UPDATED,
          user._id,
          ticket.title,
          input.title,
        ),
      );
    }

    if (input.description !== undefined && input.description !== ticket.description) {
      await auditService.appendHistory(
        id,
        auditService.buildFieldChangeEntry(
          HistoryActions.DESCRIPTION_CHANGED,
          user._id,
          ticket.description,
          input.description,
        ),
      );
    }

    if (input.priority !== undefined && input.priority !== ticket.priority) {
      await auditService.appendHistory(
        id,
        auditService.buildFieldChangeEntry(
          HistoryActions.PRIORITY_CHANGED,
          user._id,
          ticket.priority,
          input.priority,
        ),
      );
    }

    const updated = await ticketRepository.updateById(id, {
      ...input,
      lastUpdatedBy: user._id,
    });

    if (!updated) {
      throw new AppError(ErrorCodes.TICKET_NOT_FOUND, 'Ticket not found', 404);
    }

    return toTicketDto(updated);
  },

  async updateStatus(user: UserRecord, id: string, status: TicketStatus) {
    const ticket = await this.getTicketDocumentOrThrow(id);
    permissionService.assertCanChangeStatus(user, ticket, status);
    validateTransition(ticket.status, status);

    await auditService.appendHistory(
      id,
      auditService.buildStatusChangeEntry(user._id, ticket.status, status),
    );

    const updated = await ticketRepository.updateById(id, {
      status,
      lastUpdatedBy: user._id,
    });

    if (!updated) {
      throw new AppError(ErrorCodes.TICKET_NOT_FOUND, 'Ticket not found', 404);
    }

    return toTicketDto(updated);
  },

  async assignTicket(user: UserRecord, id: string, input: PatchTicketAssignBody) {
    const ticket = await this.getTicketDocumentOrThrow(id);
    permissionService.assertCanAssignTicket(user, ticket);

    if (input.assignedTo) {
      await userService.ensureAssignableUser(input.assignedTo, 'assignedTo');
    }

    const previousAssignee = ticket.assignedTo?.toString() ?? null;

    await auditService.appendHistory(
      id,
      auditService.buildAssignmentEntry(user._id, previousAssignee, input.assignedTo),
    );

    const updated = await ticketRepository.updateById(id, {
      assignedTo: input.assignedTo,
      lastUpdatedBy: user._id,
    });

    if (!updated) {
      throw new AppError(ErrorCodes.TICKET_NOT_FOUND, 'Ticket not found', 404);
    }

    return toTicketDto(updated);
  },

  async listTickets(user: UserRecord, query: TicketListQuery): Promise<PaginatedTickets> {
    const result = await ticketRepository.findWithQuery(mapListQuery(query, user));

    return toPaginatedTicketsDto(result.items, {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    });
  },

  async searchTickets(user: UserRecord, query: TicketSearchQuery): Promise<PaginatedTickets> {
    const baseFilters = mapListQuery(query, user);

    if (!query.q?.trim()) {
      return this.listTickets(user, query);
    }

    const ticketIds = await resolveSearchTicketIds(
      query.q,
      baseFilters.scopeFilter ?? {},
    );

    if (ticketIds.length === 0) {
      return {
        items: [],
        pagination: {
          page: baseFilters.page ?? 1,
          limit: baseFilters.limit ?? 20,
          total: 0,
          totalPages: 0,
        },
      };
    }

    const result = await ticketRepository.findWithQuery({
      ...baseFilters,
      ticketIds,
    });

    return toPaginatedTicketsDto(result.items, {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    });
  },

  async getDashboardStats(user: UserRecord): Promise<DashboardStats> {
    const scopeFilter = permissionService.getTicketListFilter(user);
    const counts = await ticketRepository.countByStatus(scopeFilter);
    const recentTickets = await ticketRepository.findRecent(scopeFilter, 5);

    const baseStats = ALL_TICKET_STATUSES.reduce<Record<string, number>>((acc, status) => {
      acc[status] = counts[status] ?? 0;
      return acc;
    }, {});

    if (user.role === Roles.EMPLOYEE) {
      return {
        role: user.role,
        stats: {
          myOpen: baseStats[TicketStatuses.OPEN] ?? 0,
          myInProgress: baseStats[TicketStatuses.IN_PROGRESS] ?? 0,
          myResolved: baseStats[TicketStatuses.RESOLVED] ?? 0,
          myClosed: baseStats[TicketStatuses.CLOSED] ?? 0,
          myCancelled: baseStats[TicketStatuses.CANCELLED] ?? 0,
        },
        recentTickets: recentTickets.map(toTicketDto),
      };
    }

    if (user.role === Roles.ADMIN) {
      const [createdByMe, assignedToMe, waitingForAction] = await Promise.all([
        ticketRepository.countCreatedBy(user._id, scopeFilter),
        ticketRepository.countAssignedTo(user._id, scopeFilter),
        ticketRepository.countWaitingForAction(user._id, scopeFilter),
      ]);

      return {
        role: user.role,
        stats: {
          createdByMe,
          assignedToMe,
          waitingForAction,
          resolved: baseStats[TicketStatuses.RESOLVED] ?? 0,
          closed: baseStats[TicketStatuses.CLOSED] ?? 0,
        },
        recentTickets: recentTickets.map(toTicketDto),
      };
    }

    const users = await userRepository.findAll();
    const employeeCount = users.filter((entry) => entry.role === Roles.EMPLOYEE).length;
    const adminCount = users.filter((entry) => entry.role === Roles.ADMIN).length;
    const averageResolutionHours = await ticketRepository.averageResolutionHours(scopeFilter);

    return {
      role: user.role,
      stats: {
        users: users.length,
        employees: employeeCount,
        admins: adminCount,
        open: baseStats[TicketStatuses.OPEN] ?? 0,
        inProgress: baseStats[TicketStatuses.IN_PROGRESS] ?? 0,
        resolved: baseStats[TicketStatuses.RESOLVED] ?? 0,
        closed: baseStats[TicketStatuses.CLOSED] ?? 0,
        cancelled: baseStats[TicketStatuses.CANCELLED] ?? 0,
        averageResolutionHours,
      },
      recentTickets: recentTickets.map(toTicketDto),
    };
  },

  async getStats(user: UserRecord): Promise<TicketStats> {
    const dashboard = await this.getDashboardStats(user);
    const stats = dashboard.stats;

    if (user.role === Roles.EMPLOYEE) {
      return {
        [TicketStatuses.OPEN]: stats.myOpen ?? 0,
        [TicketStatuses.IN_PROGRESS]: stats.myInProgress ?? 0,
        [TicketStatuses.RESOLVED]: stats.myResolved ?? 0,
        [TicketStatuses.CLOSED]: stats.myClosed ?? 0,
        [TicketStatuses.CANCELLED]: stats.myCancelled ?? 0,
      };
    }

    return {
      [TicketStatuses.OPEN]: stats.open ?? stats.myOpen ?? 0,
      [TicketStatuses.IN_PROGRESS]: stats.inProgress ?? stats.myInProgress ?? 0,
      [TicketStatuses.RESOLVED]: stats.resolved ?? 0,
      [TicketStatuses.CLOSED]: stats.closed ?? 0,
      [TicketStatuses.CANCELLED]: stats.cancelled ?? 0,
    };
  },

  async getTicketDocumentOrThrow(id: string) {
    if (!isValidObjectId(id)) {
      throw new AppError(ErrorCodes.INVALID_OBJECT_ID, 'Invalid ticket id', 400, [
        { field: 'id', message: 'Invalid ObjectId format' },
      ]);
    }

    const ticket = await ticketRepository.findById(id);

    if (!ticket) {
      throw new AppError(ErrorCodes.TICKET_NOT_FOUND, 'Ticket not found', 404);
    }

    return ticket;
  },
};
