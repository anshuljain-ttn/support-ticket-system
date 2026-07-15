import type { Response } from 'express';
import { describe, expect, it, vi } from 'vitest';

import { failure, success } from '@/utils/api-response.js';

function createMockResponse(): {
  status: ReturnType<typeof vi.fn>;
  json: ReturnType<typeof vi.fn>;
  res: Response;
} {
  const status = vi.fn().mockReturnThis();
  const json = vi.fn().mockReturnThis();

  return {
    status,
    json,
    res: { status, json } as unknown as Response,
  };
}

describe('api-response helpers', () => {
  it('formats success responses per spec envelope', () => {
    const { status, json, res } = createMockResponse();
    const data = { id: '123', title: 'Test ticket' };

    success(res, data);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ success: true, data });
  });

  it('formats failure responses per spec envelope', () => {
    const { status, json, res } = createMockResponse();

    failure(res, 'VALIDATION_ERROR', 'Validation failed', 400, [
      { field: 'title', message: 'Title is required' },
    ]);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: [{ field: 'title', message: 'Title is required' }],
      },
    });
  });
});
