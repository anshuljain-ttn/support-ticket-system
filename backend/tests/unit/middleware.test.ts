import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { ErrorCodes } from '@/constants/error-codes.js';
import { createApp } from '@/app.js';
import { errorHandler } from '@/middleware/error.middleware.js';
import { notFoundHandler } from '@/middleware/not-found.middleware.js';
import { validate } from '@/middleware/validate.middleware.js';
import { AppError } from '@/utils/app-error.js';

function createErrorTestApp(): express.Application {
  const app = express();

  app.use(express.json());

  app.get('/app-error', () => {
    throw new AppError(ErrorCodes.TICKET_NOT_FOUND, 'Ticket not found', 404);
  });

  app.get('/internal-error', () => {
    throw new Error('Unexpected failure');
  });

  app.post(
    '/validate',
    validate(
      z.object({
        title: z.string().min(3),
      }),
    ),
    (_req, res) => {
      res.status(200).json({ ok: true });
    },
  );

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

describe('middleware stack', () => {
  it('returns 404 error envelope for unknown routes', async () => {
    const app = createApp();
    const response = await request(app).get('/does-not-exist');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success: false,
      error: {
        code: ErrorCodes.NOT_FOUND,
        message: 'Route GET /does-not-exist not found',
      },
    });
  });

  it('returns AppError envelope with details', async () => {
    const app = createErrorTestApp();
    const response = await request(app).get('/app-error');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success: false,
      error: {
        code: ErrorCodes.TICKET_NOT_FOUND,
        message: 'Ticket not found',
      },
    });
  });

  it('returns validation error envelope from validate middleware', async () => {
    const app = createErrorTestApp();
    const response = await request(app).post('/validate').send({ title: 'ab' });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
      error: {
        code: ErrorCodes.VALIDATION_ERROR,
        details: [
          {
            field: 'title',
            message: expect.any(String) as string,
          },
        ],
      },
    });
  });

  it('returns internal error envelope for unhandled errors', async () => {
    const app = createErrorTestApp();
    const response = await request(app).get('/internal-error');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'Internal server error',
      },
    });
  });
});
