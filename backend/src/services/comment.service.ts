import { toCommentDto } from '@/dto/comment.dto.js';
import { commentRepository } from '@/repositories/comment.repository.js';
import { permissionService } from '@/services/permission.service.js';
import { ticketService } from '@/services/ticket.service.js';
import type { CommentRecord } from '@/types/ticket.types.js';
import type { UserRecord } from '@/types/user.types.js';
import type { CreateCommentBody } from '@/validators/comment.validator.js';

export const commentService = {
  async addComment(
    user: UserRecord,
    ticketId: string,
    input: CreateCommentBody,
  ): Promise<CommentRecord> {
    const ticket = await ticketService.getTicketDocumentOrThrow(ticketId);
    permissionService.assertCanCommentOnTicket(user, ticket);

    const comment = await commentRepository.create({
      ticketId,
      message: input.message,
      createdBy: user._id,
    });

    return toCommentDto(comment);
  },
};
