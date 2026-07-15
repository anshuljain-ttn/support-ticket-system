import { apiClient, unwrapApiResponse } from '@/services/api-client';
import type { ApiResponse } from '@/types/api.types';
import type { LoginInput, LoginResponse, User } from '@/types/user.types';

export async function login(input: LoginInput): Promise<LoginResponse> {
  const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', input);
  return unwrapApiResponse(response.data);
}

export async function logout(): Promise<void> {
  const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/logout');
  unwrapApiResponse(response.data);
}

export async function getCurrentUser(): Promise<User> {
  const response = await apiClient.get<ApiResponse<User>>('/auth/me');
  return unwrapApiResponse(response.data);
}

export const authService = {
  login,
  logout,
  getCurrentUser,
};
