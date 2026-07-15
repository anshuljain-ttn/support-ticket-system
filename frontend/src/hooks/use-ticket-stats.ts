'use client';

import { useQuery } from '@tanstack/react-query';

import { ticketKeys } from '@/hooks/ticket-keys';
import { dashboardService } from '@/services/dashboard.service';

export function useDashboardStats() {
  return useQuery({
    queryKey: ticketKeys.dashboard(),
    queryFn: dashboardService.getDashboardStats,
  });
}

/** @deprecated Use useDashboardStats instead */
export function useTicketStats() {
  return useDashboardStats();
}
