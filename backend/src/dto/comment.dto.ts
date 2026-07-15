import type { CommentDocument } from '@/models/comment.model.js';
import type { CommentRecord } from '@/types/ticket.types.js';

export function toCommentDto(comment: CommentDocument): CommentRecord {
  return {
    _id: comment._id.toString(),
    ticketId: comment.ticketId.toString(),
    message: comment.message,
    createdBy: comment.createdBy.toString(),
    createdAt: comment.createdAt.toISOString(),
  };
}

export function toCommentDtoList(comments: CommentDocument[]): CommentRecord[] {
  return comments.map(toCommentDto);
}
