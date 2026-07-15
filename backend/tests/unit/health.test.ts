import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from '@/app.js';

describe('GET /health', () => {
  it('returns 200 with health payload', async () => {
    const app = createApp();
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      data: {
        status: 'ok',
        timestamp: expect.any(String) as string,
        uptime: expect.any(Number) as number,
      },
    });
  });
});
