import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from '@/app.js';
import { documentedOperationCount, swaggerSpec } from '@/config/swagger.js';

describe('Swagger / OpenAPI', () => {
  it('serves Swagger UI at /api-docs', async () => {
    const app = createApp();
    const response = await request(app).get('/api-docs/');

    expect(response.status).toBe(200);
    expect(response.text).toContain('swagger');
  });

  it('serves OpenAPI JSON at /api-docs.json', async () => {
    const app = createApp();
    const response = await request(app).get('/api-docs.json');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      openapi: '3.0.0',
      info: {
        title: 'Support Ticket Management API',
        version: '1.0.0',
      },
    });
  });

  it('documents all 9 API endpoints', () => {
    expect(documentedOperationCount).toBe(9);

    const paths = (swaggerSpec as { paths: Record<string, Record<string, unknown>> }).paths;

    expect(paths['/health']?.get).toBeDefined();
    expect(paths['/users']?.get).toBeDefined();
    expect(paths['/tickets']?.get).toBeDefined();
    expect(paths['/tickets']?.post).toBeDefined();
    expect(paths['/tickets/search']?.get).toBeDefined();
    expect(paths['/tickets/{id}']?.get).toBeDefined();
    expect(paths['/tickets/{id}']?.put).toBeDefined();
    expect(paths['/tickets/{id}/status']?.patch).toBeDefined();
    expect(paths['/tickets/{id}/comments']?.post).toBeDefined();
  });

  it('defines request and response schemas', () => {
    const schemas = (
      swaggerSpec as {
        components: { schemas: Record<string, unknown> };
      }
    ).components.schemas;

    expect(schemas.CreateTicketRequest).toBeDefined();
    expect(schemas.UpdateTicketRequest).toBeDefined();
    expect(schemas.PatchTicketStatusRequest).toBeDefined();
    expect(schemas.CreateCommentRequest).toBeDefined();
    expect(schemas.Ticket).toBeDefined();
    expect(schemas.TicketDetail).toBeDefined();
    expect(schemas.PaginatedTickets).toBeDefined();
    expect(schemas.Comment).toBeDefined();
    expect(schemas.ApiErrorResponse).toBeDefined();
  });
});
