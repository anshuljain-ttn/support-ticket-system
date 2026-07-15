import { ALL_TICKET_STATUSES } from '@/constants/status-transitions.js';
import { ErrorCodes } from '@/constants/error-codes.js';
import { toCommentDtoList } from '@/dto/comment.dto.js';
import { toPaginatedTicketsDto, toTicketDto } from '@/dto/ticket.dto.js';
import { commentRepository } from '@/repositories/comment.repository.js';
import { ticketRepository } from '@/repositories/ticket.repository.js';
import { getAllowedTransitions, validateTransition } from '@/services/status-machine.service.js';
import { userService } from '@/services/user.service.js';
import type {
  PaginatedTickets,
  TicketDetail,
  TicketStats,
  TicketStatus,
} from '@/types/ticket.types.js';
import { TicketStatuses } from '@/types/ticket.types.js';
import type {
  CreateTicketBody,
  TicketListQuery,
  TicketSearchQuery,
  UpdateTicketBody,
} from '@/validators/ticket.validator.js';
import { AppError } from '@/utils/app-error.js';
import { isValidObjectId } from '@/utils/object-id.js';

function mapListQuery(query: TicketListQuery) {
  return {
    status: query.status,
    priority: query.priority,
    assignedTo: query.assignedTo,
    sort: query.sort,
    page: query.page,
    limit: query.limit,
  };
}

async function resolveSearchTicketIds(search: string): Promise<string[]> {
  const [ticketIds, commentTicketIds] = await Promise.all([
    ticketRepository.findIdsByTextSearch(search),
    commentRepository.findTicketIdsByMessageSearch(search),
  ]);

  return [...new Set([...ticketIds, ...commentTicketIds])];
}

export const ticketService = {
  async createTicket(input: CreateTicketBody) {
    await userService.ensureUserExists(input.createdBy, 'createdBy');

    if (input.assignedTo) {
      await userService.ensureUserExists(input.assignedTo, 'assignedTo');
    }

    const ticket = await ticketRepository.create({
      title: input.title,
      description: input.description,
      priority: input.priority,
      createdBy: input.createdBy,
      assignedTo: input.assignedTo ?? null,
      status: TicketStatuses.OPEN,
    });

    return toTicketDto(ticket);
  },

  async getTicketById(id: string): Promise<TicketDetail> {
    if (!isValidObjectId(id)) {
      throw new AppError(ErrorCodes.INVALID_OBJECT_ID, 'Invalid ticket id', 400, [
        { field: 'id', message: 'Invalid ObjectId format' },
      ]);
    }

    const ticket = await ticketRepository.findById(id);

    if (!ticket) {
      throw new AppError(ErrorCodes.TICKET_NOT_FOUND, 'Ticket not found', 404);
    }

    const comments = await commentRepository.findByTicketId(id);

    return {
      ticket: toTicketDto(ticket),
      comments: toCommentDtoList(comments),
      allowedTransitions: getAllowedTransitions(ticket.status),
    };
  },

  async updateTicket(id: string, input: UpdateTicketBody) {
    const ticket = await this.getTicketDocumentOrThrow(id);

    if (input.assignedTo) {
      await userService.ensureUserExists(input.assignedTo, 'assignedTo');
    }

    if (input.status !== undefined) {
      validateTransition(ticket.status, input.status);
    }

    const updated = await ticketRepository.updateById(id, input);

    if (!updated) {
      throw new AppError(ErrorCodes.TICKET_NOT_FOUND, 'Ticket not found', 404);
    }

    return toTicketDto(updated);
  },

  async updateStatus(id: string, status: TicketStatus) {
    const ticket = await this.getTicketDocumentOrThrow(id);
    validateTransition(ticket.status, status);

    const updated = await ticketRepository.updateById(id, { status });

    if (!updated) {
      throw new AppError(ErrorCodes.TICKET_NOT_FOUND, 'Ticket not found', 404);
    }

    return toTicketDto(updated);
  },

  async listTickets(query: TicketListQuery): Promise<PaginatedTickets> {
    const result = await ticketRepository.findWithQuery(mapListQuery(query));

    return toPaginatedTicketsDto(result.items, {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    });
  },

  async searchTickets(query: TicketSearchQuery): Promise<PaginatedTickets> {
    const baseFilters = mapListQuery(query);

    if (!query.q?.trim()) {
      return this.listTickets(query);
    }

    const ticketIds = await resolveSearchTicketIds(query.q);

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

  async getStats(): Promise<TicketStats> {
    const counts = await ticketRepository.countByStatus();

    return ALL_TICKET_STATUSES.reduce((acc, status) => {
      acc[status] = counts[status] ?? 0;
      return acc;
    }, {} as TicketStats);
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
