'use client';

import { useQuery } from '@tanstack/react-query';

import { ticketKeys } from '@/hooks/ticket-keys';
import { ticketService } from '@/services/ticket.service';

export function useTicketStats() {
  return useQuery({
    queryKey: ticketKeys.stats(),
    queryFn: ticketService.getTicketStats,
  });
}
