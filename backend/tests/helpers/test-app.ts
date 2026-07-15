import request, { type Agent } from 'supertest';
import type { Application } from 'express';
import { expect } from 'vitest';

import { createApp } from '@/app.js';
import { ErrorCodes } from '@/constants/error-codes.js';
import { TicketPriorities, type TicketPriority } from '@/types/ticket.types.js';

type CreateTicketOverrides = Partial<{
  title: string;
  description: string;
  priority: TicketPriority;
}>;

const DEFAULT_PASSWORD = 'Password123!';

export function createTestApp(): Application {
  return createApp();
}

export function buildCreateTicketPayload(overrides: CreateTicketOverrides = {}) {
  return {
    title: 'VPN issue',
    description: 'Unable to connect to corporate VPN from home.',
    priority: TicketPriorities.HIGH,
    ...overrides,
  };
}

export async function loginViaApi(
  app: Application,
  email: string,
  password = DEFAULT_PASSWORD,
): Promise<Agent> {
  const agent = request.agent(app);
  const response = await agent.post('/auth/login').send({ email, password });

  if (response.status !== 200) {
    throw new Error(`Expected login success for ${email}, received ${response.status}`);
  }

  return agent;
}

export async function createTicketViaApi(
  agent: Agent,
  overrides: CreateTicketOverrides = {},
): Promise<string> {
  const response = await agent.post('/tickets').send(buildCreateTicketPayload(overrides));

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
  agent: Agent,
  ticketId: string,
  status: string,
): Promise<request.Response> {
  return agent.patch(`/tickets/${ticketId}/status`).send({ status });
}

export async function putTicket(
  agent: Agent,
  ticketId: string,
  body: Record<string, unknown>,
): Promise<request.Response> {
  return agent.put(`/tickets/${ticketId}`).send(body);
}
