import { apiClient, unwrapApiResponse } from '@/services/api-client';
import type { ApiResponse } from '@/types/api.types';
import type { User } from '@/types/user.types';

export async function getUsers(): Promise<User[]> {
  const response = await apiClient.get<ApiResponse<User[]>>('/users');
  return unwrapApiResponse(response.data);
}

export const userService = {
  getUsers,
};
