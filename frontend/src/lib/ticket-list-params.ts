import type {
  TicketPriority,
  TicketSearchParams,
  TicketSortOption,
  TicketStatus,
} from '@/types/ticket.types';
import { TicketPriorities, TicketStatuses } from '@/types/ticket.types';

export const DEFAULT_TICKET_LIST_LIMIT = 20;

const SORT_OPTIONS: TicketSortOption[] = ['newest', 'oldest', 'priority'];

function isTicketStatus(value: string): value is TicketStatus {
  return Object.values(TicketStatuses).includes(value as TicketStatus);
}

function isTicketPriority(value: string): value is TicketPriority {
  return Object.values(TicketPriorities).includes(value as TicketPriority);
}

function isSortOption(value: string): value is TicketSortOption {
  return SORT_OPTIONS.includes(value as TicketSortOption);
}

function getParamValues(searchParams: URLSearchParams, key: string): string[] {
  const values = searchParams.getAll(key);

  if (values.length > 1) {
    return values;
  }

  const single = searchParams.get(key);

  if (!single) {
    return [];
  }

  return single.split(',').map((value) => value.trim()).filter(Boolean);
}

function parseEnumArray<T extends string>(
  values: string[],
  guard: (value: string) => value is T,
): T[] | undefined {
  const filtered = values.filter(guard);
  return filtered.length > 0 ? filtered : undefined;
}

export function parseTicketListSearchParams(searchParams: URLSearchParams): TicketSearchParams {
  const q = searchParams.get('q')?.trim() || undefined;
  const status = parseEnumArray(getParamValues(searchParams, 'status'), isTicketStatus);
  const priority = parseEnumArray(getParamValues(searchParams, 'priority'), isTicketPriority);
  const assignedTo = searchParams.get('assignedTo')?.trim() || undefined;
  const sortParam = searchParams.get('sort')?.trim() ?? 'newest';
  const sort = isSortOption(sortParam) ? sortParam : 'newest';

  const pageParam = Number(searchParams.get('page'));
  const limitParam = Number(searchParams.get('limit'));

  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;
  const limit =
    Number.isInteger(limitParam) && limitParam > 0 && limitParam <= 100
      ? limitParam
      : DEFAULT_TICKET_LIST_LIMIT;

  return {
    q,
    status,
    priority,
    assignedTo,
    sort,
    page,
    limit,
  };
}

export function serializeTicketListSearchParams(params: TicketSearchParams): string {
  const searchParams = new URLSearchParams();

  if (params.q) {
    searchParams.set('q', params.q);
  }

  params.status?.forEach((status) => {
    searchParams.append('status', status);
  });

  params.priority?.forEach((priority) => {
    searchParams.append('priority', priority);
  });

  if (params.assignedTo) {
    searchParams.set('assignedTo', params.assignedTo);
  }

  if (params.sort && params.sort !== 'newest') {
    searchParams.set('sort', params.sort);
  }

  if (params.page && params.page !== 1) {
    searchParams.set('page', String(params.page));
  }

  if (params.limit && params.limit !== DEFAULT_TICKET_LIST_LIMIT) {
    searchParams.set('limit', String(params.limit));
  }

  return searchParams.toString();
}

export function mergeTicketListSearchParams(
  current: TicketSearchParams,
  updates: Partial<TicketSearchParams>,
): TicketSearchParams {
  const next = { ...current, ...updates };

  if (updates.q !== undefined || updates.status !== undefined || updates.priority !== undefined || updates.assignedTo !== undefined || updates.sort !== undefined) {
    if (updates.page === undefined) {
      next.page = 1;
    }
  }

  return next;
}
