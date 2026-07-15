import request from 'supertest';
import type { Application } from 'express';
import { expect } from 'vitest';

import { createApp } from '@/app.js';
import { ErrorCodes } from '@/constants/error-codes.js';
import { TicketPriorities, type TicketPriority } from '@/types/ticket.types.js';

type CreateTicketOverrides = Partial<{
  title: string;
  description: string;
  priority: TicketPriority;
  createdBy: string;
  assignedTo: string | null;
}>;

export function createTestApp(): Application {
  return createApp();
}

export function buildCreateTicketPayload(
  createdBy: string,
  overrides: CreateTicketOverrides = {},
) {
  return {
    title: 'VPN issue',
    description: 'Unable to connect to corporate VPN from home.',
    priority: TicketPriorities.HIGH,
    createdBy,
    ...overrides,
  };
}

export async function createTicketViaApi(
  app: Application,
  createdBy: string,
  overrides: CreateTicketOverrides = {},
): Promise<string> {
  const response = await request(app)
    .post('/tickets')
    .send(buildCreateTicketPayload(createdBy, overrides));

  if (response.status !== 201) {
    throw new Error(`Expected 201 creating ticket, received ${response.status}`);
  }

  return (response.body as { data: { _id: string } }).data._id;
}

export function expectValidationError(
  response: request.Response,
  field?: string,
): void {
  expect(response.status).toBe(400);
  expect(response.body).toMatchObject({
    success: false,
    error: {
      code: ErrorCodes.VALIDATION_ERROR,
      details: expect.any(Array) as unknown[],
    },
  });

  if (field) {
    const details = (response.body as { error: { details: { field: string }[] } }).error.details;
    expect(details.some((detail) => detail.field === field)).toBe(true);
  }
}

export async function patchTicketStatus(
  app: Application,
  ticketId: string,
  status: string,
): Promise<request.Response> {
  return request(app).patch(`/tickets/${ticketId}/status`).send({ status });
}

export async function putTicket(
  app: Application,
  ticketId: string,
  body: Record<string, unknown>,
): Promise<request.Response> {
  return request(app).put(`/tickets/${ticketId}`).send(body);
}
