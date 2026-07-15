export const TicketStatuses = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
  CANCELLED: 'Cancelled',
} as const;

export const TicketPriorities = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
} as const;

export type TicketStatus = (typeof TicketStatuses)[keyof typeof TicketStatuses];

export type TicketPriority = (typeof TicketPriorities)[keyof typeof TicketPriorities];

export type TicketSortOption = 'newest' | 'oldest' | 'priority';

export type TicketRecord = {
  _id: string;
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateTicketInput = {
  title: string;
  description: string;
  priority: TicketPriority;
  createdBy: string;
  assignedTo?: string | null;
  status?: TicketStatus;
};

export type UpdateTicketInput = Partial<{
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo: string | null;
}>;

export type TicketQueryFilters = {
  status?: TicketStatus[];
  priority?: TicketPriority[];
  assignedTo?: string;
  search?: string;
  ticketIds?: string[];
  sort?: TicketSortOption;
  page?: number;
  limit?: number;
};

export type TicketDetail = {
  ticket: TicketRecord;
  comments: CommentRecord[];
  allowedTransitions: TicketStatus[];
};

export type CommentRecord = {
  _id: string;
  ticketId: string;
  message: string;
  createdBy: string;
  createdAt: string;
};

export type TicketStats = Record<TicketStatus, number>;

export type PaginatedTickets = {
  items: TicketRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
