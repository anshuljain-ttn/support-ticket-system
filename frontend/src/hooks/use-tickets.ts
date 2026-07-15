'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { ticketKeys } from '@/hooks/ticket-keys';
import { ticketService } from '@/services/ticket.service';
import type { CreateTicketInput, TicketSearchParams } from '@/types/ticket.types';

export { ticketKeys } from '@/hooks/ticket-keys';

export function useTickets(params: TicketSearchParams = {}) {
  const hasSearch = Boolean(params.q?.trim());

  return useQuery({
    queryKey: ticketKeys.list(params),
    queryFn: () =>
      hasSearch ? ticketService.searchTickets(params) : ticketService.listTickets(params),
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTicketInput) => ticketService.createTicket(input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ticketKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: ticketKeys.stats() }),
      ]);
    },
  });
}
