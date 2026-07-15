import { apiClient, unwrapApiResponse } from '@/services/api-client';
import type { ApiResponse } from '@/types/api.types';
import type {
  CreateTicketInput,
  PaginatedTickets,
  Ticket,
  TicketDetail,
  TicketListParams,
  TicketSearchParams,
  TicketStats,
  TicketStatus,
  UpdateTicketInput,
} from '@/types/ticket.types';
import { ALL_TICKET_STATUSES } from '@/lib/status-transitions';

function serializeQueryParams(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') {
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        searchParams.append(key, String(item));
      }
      continue;
    }

    searchParams.append(key, String(value));
  }

  return searchParams.toString();
}

async function fetchPaginatedTickets(
  path: '/tickets' | '/tickets/search',
  params: TicketListParams | TicketSearchParams,
): Promise<PaginatedTickets> {
  const response = await apiClient.get<ApiResponse<PaginatedTickets>>(path, {
    params,
    paramsSerializer: () => serializeQueryParams(params as Record<string, unknown>),
  });

  return unwrapApiResponse(response.data);
}

export async function listTickets(params: TicketListParams = {}): Promise<PaginatedTickets> {
  return fetchPaginatedTickets('/tickets', params);
}

export async function searchTickets(params: TicketSearchParams = {}): Promise<PaginatedTickets> {
  return fetchPaginatedTickets('/tickets/search', params);
}

export async function getTicketById(id: string): Promise<TicketDetail> {
  const response = await apiClient.get<ApiResponse<TicketDetail>>(`/tickets/${id}`);
  return unwrapApiResponse(response.data);
}

export async function createTicket(input: CreateTicketInput): Promise<Ticket> {
  const response = await apiClient.post<ApiResponse<Ticket>>('/tickets', input);
  return unwrapApiResponse(response.data);
}

export async function updateTicket(id: string, input: UpdateTicketInput): Promise<Ticket> {
  const response = await apiClient.put<ApiResponse<Ticket>>(`/tickets/${id}`, input);
  return unwrapApiResponse(response.data);
}

export async function updateTicketStatus(id: string, status: TicketStatus): Promise<Ticket> {
  const response = await apiClient.patch<ApiResponse<Ticket>>(`/tickets/${id}/status`, {
    status,
  });

  return unwrapApiResponse(response.data);
}

export async function getTicketStats(): Promise<TicketStats> {
  const stats = ALL_TICKET_STATUSES.reduce((acc, status) => {
    acc[status] = 0;
    return acc;
  }, {} as TicketStats);

  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const result = await listTickets({ page, limit: 100 });

    for (const ticket of result.items) {
      stats[ticket.status] += 1;
    }

    totalPages = result.pagination.totalPages;
    page += 1;
  }

  return stats;
}

export const ticketService = {
  listTickets,
  searchTickets,
  getTicketById,
  createTicket,
  updateTicket,
  updateTicketStatus,
  getTicketStats,
};
