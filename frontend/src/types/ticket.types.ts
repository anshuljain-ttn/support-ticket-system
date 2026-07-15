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

export type Ticket = {
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

export type Comment = {
  _id: string;
  ticketId: string;
  message: string;
  createdBy: string;
  createdAt: string;
};

export type TicketDetail = {
  ticket: Ticket;
  comments: Comment[];
  allowedTransitions: TicketStatus[];
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedTickets = {
  items: Ticket[];
  pagination: PaginationMeta;
};

export type TicketStats = Record<TicketStatus, number>;

export type CreateTicketInput = {
  title: string;
  description: string;
  priority: TicketPriority;
  createdBy: string;
  assignedTo?: string | null;
};

export type UpdateTicketInput = Partial<{
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo: string | null;
}>;

export type TicketListParams = {
  status?: TicketStatus[];
  priority?: TicketPriority[];
  assignedTo?: string;
  sort?: TicketSortOption;
  page?: number;
  limit?: number;
};

export type TicketSearchParams = TicketListParams & {
  q?: string;
};

export type CreateCommentInput = {
  message: string;
  createdBy: string;
};
