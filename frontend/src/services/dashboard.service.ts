import { apiClient, unwrapApiResponse } from '@/services/api-client';
import type { ApiResponse } from '@/types/api.types';
import type { DashboardStats } from '@/types/ticket.types';

export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await apiClient.get<ApiResponse<DashboardStats>>('/dashboard/stats');
  return unwrapApiResponse(response.data);
}

export const dashboardService = {
  getDashboardStats,
};
