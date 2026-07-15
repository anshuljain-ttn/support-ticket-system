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

export type HistoryEntry = {
  _id: string;
  action: string;
  performedBy: string;
  performedAt: string;
  previousValue?: unknown;
  newValue?: unknown;
  comment?: string;
};

export type HistoryEntryInput = {
  action: string;
  performedBy: string;
  previousValue?: unknown;
  newValue?: unknown;
  comment?: string;
};

export type TicketRecord = {
  _id: string;
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo: string | null;
  createdBy: string;
  lastUpdatedBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TicketPermissions = {
  canEdit: boolean;
  canAssign: boolean;
  canChangeStatus: boolean;
  canComment: boolean;
};

export type CreateTicketInput = {
  title: string;
  description: string;
  priority: TicketPriority;
  createdBy: string;
  lastUpdatedBy: string;
  assignedTo?: string | null;
  status?: TicketStatus;
};

export type UpdateTicketInput = Partial<{
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo: string | null;
  lastUpdatedBy: string;
}>;

export type TicketQueryFilters = {
  status?: TicketStatus[];
  priority?: TicketPriority[];
  assignedTo?: string;
  createdBy?: string;
  search?: string;
  ticketIds?: string[];
  sort?: TicketSortOption;
  page?: number;
  limit?: number;
  scopeFilter?: Record<string, unknown>;
};

export type TicketDetail = {
  ticket: TicketRecord;
  comments: CommentRecord[];
  history: HistoryEntry[];
  allowedTransitions: TicketStatus[];
  permissions: TicketPermissions;
};

export type CommentRecord = {
  _id: string;
  ticketId: string;
  message: string;
  createdBy: string;
  createdAt: string;
};

export type TicketStats = Record<TicketStatus, number>;

export type DashboardStats = {
  role: string;
  stats: Record<string, number>;
  recentTickets: TicketRecord[];
};

export type PaginatedTickets = {
  items: TicketRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
