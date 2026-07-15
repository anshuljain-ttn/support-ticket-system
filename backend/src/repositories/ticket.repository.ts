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

function buildFilter(filters: TicketQueryFilters): FilterQuery<TicketDocument> {
  const query: FilterQuery<TicketDocument> = {};

  if (filters.status && filters.status.length > 0) {
    query.status = { $in: filters.status };
  }

  if (filters.priority && filters.priority.length > 0) {
    query.priority = { $in: filters.priority };
  }

  if (filters.assignedTo) {
    query.assignedTo = new Types.ObjectId(filters.assignedTo);
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
  async create(input: CreateTicketInput): Promise<TicketDocument> {
    const ticket = new Ticket({
      title: input.title,
      description: input.description,
      priority: input.priority,
      status: input.status ?? TicketStatuses.OPEN,
      createdBy: new Types.ObjectId(input.createdBy),
      assignedTo: input.assignedTo ? new Types.ObjectId(input.assignedTo) : null,
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

    return Ticket.findByIdAndUpdate(id, update, { new: true, runValidators: true }).exec();
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

  async countByStatus(): Promise<Record<string, number>> {
    const results = await Ticket.aggregate<{ _id: string; count: number }>([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    return results.reduce<Record<string, number>>((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});
  },

  async findIdsByTextSearch(search: string): Promise<string[]> {
    const tickets = await Ticket.find(
      { $text: { $search: search.trim() } },
      { _id: 1 },
    ).exec();

    return tickets.map((ticket) => ticket._id.toString());
  },

  async deleteAll(): Promise<void> {
    await Ticket.deleteMany({});
  },
};
