import { Types } from 'mongoose';

import { Comment, type CommentDocument } from '@/models/comment.model.js';

export const commentRepository = {
  async findByTicketId(ticketId: string): Promise<CommentDocument[]> {
    return Comment.find({ ticketId: new Types.ObjectId(ticketId) })
      .sort({ createdAt: 1 })
      .exec();
  },

  async findTicketIdsByMessageSearch(search: string): Promise<string[]> {
    const comments = await Comment.find(
      { $text: { $search: search.trim() } },
      { ticketId: 1 },
    ).exec();

    return [...new Set(comments.map((comment) => comment.ticketId.toString()))];
  },

  async create(input: {
    ticketId: string;
    message: string;
    createdBy: string;
  }): Promise<CommentDocument> {
    const comment = new Comment({
      ticketId: new Types.ObjectId(input.ticketId),
      message: input.message,
      createdBy: new Types.ObjectId(input.createdBy),
    });

    return comment.save();
  },

  async deleteAll(): Promise<void> {
    await Comment.deleteMany({});
  },
};
