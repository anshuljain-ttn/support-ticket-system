'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ticketKeys } from '@/hooks/ticket-keys';
import { commentService } from '@/services/comment.service';
import type { CreateCommentInput } from '@/types/ticket.types';

export function useAddComment(ticketId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCommentInput) => commentService.addComment(ticketId, input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ticketKeys.detail(ticketId) }),
        queryClient.invalidateQueries({ queryKey: ticketKeys.lists() }),
      ]);
    },
  });
}
