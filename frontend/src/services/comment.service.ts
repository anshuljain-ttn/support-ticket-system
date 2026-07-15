import { apiClient, unwrapApiResponse } from '@/services/api-client';
import type { ApiResponse } from '@/types/api.types';
import type { Comment, CreateCommentInput } from '@/types/ticket.types';

export async function addComment(ticketId: string, input: CreateCommentInput): Promise<Comment> {
  const response = await apiClient.post<ApiResponse<Comment>>(
    `/tickets/${ticketId}/comments`,
    input,
  );

  return unwrapApiResponse(response.data);
}

export const commentService = {
  addComment,
};
