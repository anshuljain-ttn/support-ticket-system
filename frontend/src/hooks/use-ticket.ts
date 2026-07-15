'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { ticketKeys } from '@/hooks/ticket-keys';
import { ticketService } from '@/services/ticket.service';
import type { AssignTicketInput, TicketStatus, UpdateTicketInput } from '@/types/ticket.types';

export function useTicket(id: string) {
  return useQuery({
    queryKey: ticketKeys.detail(id),
    queryFn: () => ticketService.getTicketById(id),
    enabled: Boolean(id),
  });
}

export function useUpdateTicket(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateTicketInput) => ticketService.updateTicket(id, input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ticketKeys.detail(id) }),
        queryClient.invalidateQueries({ queryKey: ticketKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: ticketKeys.dashboard() }),
      ]);
    },
  });
}

export function useUpdateTicketStatus(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (status: TicketStatus) => ticketService.updateTicketStatus(id, status),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ticketKeys.detail(id) }),
        queryClient.invalidateQueries({ queryKey: ticketKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: ticketKeys.dashboard() }),
      ]);
    },
  });
}

export function useAssignTicket(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AssignTicketInput) => ticketService.assignTicket(id, input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ticketKeys.detail(id) }),
        queryClient.invalidateQueries({ queryKey: ticketKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: ticketKeys.dashboard() }),
      ]);
    },
  });
}
