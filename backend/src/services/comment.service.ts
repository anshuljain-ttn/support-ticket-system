import { toCommentDto } from '@/dto/comment.dto.js';
import { commentRepository } from '@/repositories/comment.repository.js';
import { ticketService } from '@/services/ticket.service.js';
import { userService } from '@/services/user.service.js';
import type { CommentRecord } from '@/types/ticket.types.js';
import type { CreateCommentBody } from '@/validators/comment.validator.js';

export const commentService = {
  async addComment(ticketId: string, input: CreateCommentBody): Promise<CommentRecord> {
    await ticketService.getTicketDocumentOrThrow(ticketId);
    await userService.ensureUserExists(input.createdBy, 'createdBy');

    const comment = await commentRepository.create({
      ticketId,
      message: input.message,
      createdBy: input.createdBy,
    });

    return toCommentDto(comment);
  },
};
