import type { NextFunction, Request, Response } from 'express';

import { commentService } from '@/services/comment.service.js';
import type { CreateCommentBody } from '@/validators/comment.validator.js';
import { success } from '@/utils/api-response.js';

export async function addComment(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const comment = await commentService.addComment(req.user!, id, req.body as CreateCommentBody);
    success(res, comment, 201);
  } catch (error) {
    next(error);
  }
}
