import type { UserRole } from '@/types/user.types';

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

export const HistoryActions = {
  CREATED: 'CREATED',
  STATUS_CHANGED: 'STATUS_CHANGED',
  ASSIGNED: 'ASSIGNED',
  UPDATED: 'UPDATED',
  PRIORITY_CHANGED: 'PRIORITY_CHANGED',
  DESCRIPTION_CHANGED: 'DESCRIPTION_CHANGED',
} as const;

export type TicketStatus = (typeof TicketStatuses)[keyof typeof TicketStatuses];

export type TicketPriority = (typeof TicketPriorities)[keyof typeof TicketPriorities];

export type HistoryAction = (typeof HistoryActions)[keyof typeof HistoryActions];

export type TicketSortOption = 'newest' | 'oldest' | 'priority';

export type Ticket = {
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

export type Comment = {
  _id: string;
  ticketId: string;
  message: string;
  createdBy: string;
  createdAt: string;
};

export type HistoryEntry = {
  _id: string;
  action: HistoryAction | string;
  performedBy: string;
  performedAt: string;
  previousValue?: unknown;
  newValue?: unknown;
  comment?: string;
};

export type TicketPermissions = {
  canEdit: boolean;
  canAssign: boolean;
  canChangeStatus: boolean;
  canComment: boolean;
};

export type TicketDetail = {
  ticket: Ticket;
  comments: Comment[];
  history: HistoryEntry[];
  allowedTransitions: TicketStatus[];
  permissions: TicketPermissions;
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

export type DashboardStats = {
  role: UserRole;
  stats: Record<string, number>;
  recentTickets: Ticket[];
};

export type CreateTicketInput = {
  title: string;
  description: string;
  priority: TicketPriority;
};

export type UpdateTicketInput = Partial<{
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo: string | null;
}>;

export type AssignTicketInput = {
  assignedTo: string | null;
};

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
};
