import type { TicketListParams, TicketSearchParams } from '@/types/ticket.types';

export const ticketKeys = {
  all: ['tickets'] as const,
  lists: () => [...ticketKeys.all, 'list'] as const,
  list: (params: TicketListParams | TicketSearchParams) =>
    [...ticketKeys.lists(), normalizeTicketParams(params)] as const,
  details: () => [...ticketKeys.all, 'detail'] as const,
  detail: (id: string) => [...ticketKeys.details(), id] as const,
  stats: () => [...ticketKeys.all, 'stats'] as const,
};

function normalizeTicketParams(
  params: TicketListParams | TicketSearchParams,
): TicketListParams | TicketSearchParams {
  return {
    ...params,
    q: 'q' in params ? params.q?.trim() || undefined : undefined,
    status: params.status?.length ? [...params.status].sort() : undefined,
    priority: params.priority?.length ? [...params.priority].sort() : undefined,
  };
}

export { normalizeTicketParams };
