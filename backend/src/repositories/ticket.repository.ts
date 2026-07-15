import { Types, type FilterQuery } from 'mongoose';

import { Ticket, type TicketDocument } from '@/models/ticket.model.js';
import type {
  CreateTicketInput,
  TicketQueryFilters,
  TicketSortOption,
  UpdateTicketInput,
} from '@/types/ticket.types.js';
import { TicketPriorities, TicketStatuses } from '@/types/ticket.types.js';
import { getPagination, getTotalPages } from '@/utils/pagination.js';

const PRIORITY_RANK: Record<string, number> = {
  [TicketPriorities.CRITICAL]: 4,
  [TicketPriorities.HIGH]: 3,
  [TicketPriorities.MEDIUM]: 2,
  [TicketPriorities.LOW]: 1,
};

type TicketListResult = {
  items: TicketDocument[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type HistoryPushInput = {
  action: string;
  performedBy: string;
  performedAt: Date;
  previousValue?: unknown;
  newValue?: unknown;
  comment?: string;
};

function buildFilter(filters: TicketQueryFilters): FilterQuery<TicketDocument> {
  const query: FilterQuery<TicketDocument> = {
    ...(filters.scopeFilter ?? {}),
  };

  if (filters.status && filters.status.length > 0) {
    query.status = { $in: filters.status };
  }

  if (filters.priority && filters.priority.length > 0) {
    query.priority = { $in: filters.priority };
  }

  if (filters.assignedTo) {
    query.assignedTo = new Types.ObjectId(filters.assignedTo);
  }

  if (filters.createdBy) {
    query.createdBy = new Types.ObjectId(filters.createdBy);
  }

  if (filters.ticketIds && filters.ticketIds.length > 0) {
    query._id = { $in: filters.ticketIds.map((id) => new Types.ObjectId(id)) };
  }

  if (filters.search && filters.search.trim().length > 0 && !filters.ticketIds) {
    query.$text = { $search: filters.search.trim() };
  }

  return query;
}

function buildSort(sort: TicketSortOption = 'newest'): Record<string, 1 | -1> {
  switch (sort) {
    case 'oldest':
      return { createdAt: 1 };
    case 'priority':
      return { priority: 1, createdAt: -1 };
    case 'newest':
    default:
      return { createdAt: -1 };
  }
}

export const ticketRepository = {
  async create(input: CreateTicketInput, historyEntry: HistoryPushInput): Promise<TicketDocument> {
    const ticket = new Ticket({
      title: input.title,
      description: input.description,
      priority: input.priority,
      status: input.status ?? TicketStatuses.OPEN,
      createdBy: new Types.ObjectId(input.createdBy),
      lastUpdatedBy: new Types.ObjectId(input.lastUpdatedBy),
      assignedTo: input.assignedTo ? new Types.ObjectId(input.assignedTo) : null,
      history: [
        {
          action: historyEntry.action,
          performedBy: new Types.ObjectId(historyEntry.performedBy),
          performedAt: historyEntry.performedAt,
          previousValue: historyEntry.previousValue,
          newValue: historyEntry.newValue,
          comment: historyEntry.comment,
        },
      ],
    });

    return ticket.save();
  },

  async findById(id: string): Promise<TicketDocument | null> {
    return Ticket.findById(id).exec();
  },

  async updateById(id: string, input: UpdateTicketInput): Promise<TicketDocument | null> {
    const update: Partial<TicketDocument> = {};

    if (input.title !== undefined) {
      update.title = input.title;
    }

    if (input.description !== undefined) {
      update.description = input.description;
    }

    if (input.priority !== undefined) {
      update.priority = input.priority;
    }

    if (input.status !== undefined) {
      update.status = input.status;
    }

    if (input.assignedTo !== undefined) {
      update.assignedTo = input.assignedTo ? new Types.ObjectId(input.assignedTo) : null;
    }

    if (input.lastUpdatedBy !== undefined) {
      update.lastUpdatedBy = new Types.ObjectId(input.lastUpdatedBy);
    }

    return Ticket.findByIdAndUpdate(id, update, { new: true, runValidators: true }).exec();
  },

  async pushHistory(id: string, entry: HistoryPushInput): Promise<void> {
    await Ticket.findByIdAndUpdate(id, {
      $push: {
        history: {
          action: entry.action,
          performedBy: new Types.ObjectId(entry.performedBy),
          performedAt: entry.performedAt,
          previousValue: entry.previousValue,
          newValue: entry.newValue,
          comment: entry.comment,
        },
      },
    }).exec();
  },

  async deleteById(id: string): Promise<TicketDocument | null> {
    return Ticket.findByIdAndDelete(id).exec();
  },

  async findWithQuery(filters: TicketQueryFilters): Promise<TicketListResult> {
    const { page, limit, skip } = getPagination(filters.page, filters.limit);
    const filter = buildFilter(filters);

    if (filters.sort === 'priority') {
      const [items, total] = await Promise.all([
        Ticket.aggregate<TicketDocument>([
          { $match: filter },
          {
            $addFields: {
              priorityRank: {
                $switch: {
                  branches: Object.entries(PRIORITY_RANK).map(([priority, rank]) => ({
                    case: { $eq: ['$priority', priority] },
                    then: rank,
                  })),
                  default: 0,
                },
              },
            },
          },
          { $sort: { priorityRank: -1, createdAt: -1 } },
          { $skip: skip },
          { $limit: limit },
        ]),
        Ticket.countDocuments(filter),
      ]);

      return {
        items,
        total,
        page,
        limit,
        totalPages: getTotalPages(total, limit),
      };
    }

    const sort = buildSort(filters.sort);
    const [items, total] = await Promise.all([
      Ticket.find(filter).sort(sort).skip(skip).limit(limit).exec(),
      Ticket.countDocuments(filter),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: getTotalPages(total, limit),
    };
  },

  async findRecent(
    scopeFilter: FilterQuery<TicketDocument>,
    limit = 5,
  ): Promise<TicketDocument[]> {
    return Ticket.find(scopeFilter).sort({ updatedAt: -1 }).limit(limit).exec();
  },

  async countByStatus(scopeFilter: FilterQuery<TicketDocument> = {}): Promise<Record<string, number>> {
    const results = await Ticket.aggregate<{ _id: string; count: number }>([
      { $match: scopeFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    return results.reduce<Record<string, number>>((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});
  },

  async countAssignedTo(userId: string, scopeFilter: FilterQuery<TicketDocument> = {}): Promise<number> {
    return Ticket.countDocuments({
      ...scopeFilter,
      assignedTo: new Types.ObjectId(userId),
    });
  },

  async countCreatedBy(userId: string, scopeFilter: FilterQuery<TicketDocument> = {}): Promise<number> {
    return Ticket.countDocuments({
      ...scopeFilter,
      createdBy: new Types.ObjectId(userId),
    });
  },

  async countWaitingForAction(
    userId: string,
    scopeFilter: FilterQuery<TicketDocument> = {},
  ): Promise<number> {
    return Ticket.countDocuments({
      ...scopeFilter,
      createdBy: { $ne: new Types.ObjectId(userId) },
      status: {
        $in: [TicketStatuses.OPEN, TicketStatuses.IN_PROGRESS, TicketStatuses.RESOLVED],
      },
    });
  },

  async averageResolutionHours(scopeFilter: FilterQuery<TicketDocument> = {}): Promise<number> {
    const results = await Ticket.aggregate<{ averageHours: number }>([
      {
        $match: {
          ...scopeFilter,
          status: { $in: [TicketStatuses.RESOLVED, TicketStatuses.CLOSED] },
        },
      },
      {
        $project: {
          resolutionHours: {
            $divide: [{ $subtract: ['$updatedAt', '$createdAt'] }, 1000 * 60 * 60],
          },
        },
      },
      {
        $group: {
          _id: null,
          averageHours: { $avg: '$resolutionHours' },
        },
      },
    ]);

    return Math.round(results[0]?.averageHours ?? 0);
  },

  async findIdsByTextSearch(search: string, scopeFilter: FilterQuery<TicketDocument> = {}): Promise<string[]> {
    const tickets = await Ticket.find(
      {
        ...scopeFilter,
        $text: { $search: search.trim() },
      },
      { _id: 1 },
    ).exec();

    return tickets.map((ticket) => ticket._id.toString());
  },

  async deleteAll(): Promise<void> {
    await Ticket.deleteMany({});
  },
};
